import {Vine} from 'grapevine';
import {$map, $pipe} from 'gs-tools/export/collect';
import {BehaviorSubject, combineLatest, defer, EMPTY, merge, Observable, of, Subject, timer} from 'rxjs';
import {catchError, distinctUntilChanged, mapTo, shareReplay, switchMap} from 'rxjs/operators';

import {RenderContext} from '../render/types/render-context';
import {Bindings, BindingSpec, OutputBinding, ResolvedBindingSpec, ResolvedBindingSpecProvider, ShadowBindings, Spec} from '../types/ctrl';
import {ApiType, IOType, IValue, OValue} from '../types/io';
import {CustomElementRegistration, RegistrationSpec} from '../types/registration';
import {setValueObservable} from '../util/value-observable';

import {createBindings} from './create-bindings';
import {$getTemplate} from './templates-cache';


const CLEANUP_DELAY_MS = 1000;

type DecoratedHtmlElement = HTMLElement & {
  connectedCallback(): void;
  disconnectedCallback(): void;
};

export function upgradeElement(
    registration: CustomElementRegistration<HTMLElement, Spec>,
    element: DecoratedHtmlElement,
    isConnected$: Subject<boolean>,
    vine: Vine,
): void {
  const shadowRoot = createShadow(registration, element, vine);
  createProperties(registration, element);
  createMethods(registration, element);
  createCtrl(registration, element, shadowRoot, vine, isConnected$);
  Object.setPrototypeOf(element, registration.$ctor.get(vine).prototype);
}

function createCtrl(
    registrationSpec: CustomElementRegistration<HTMLElement, Spec>,
    element: HTMLElement,
    shadowRoot: ShadowRoot,
    vine: Vine,
    isConnected$: Observable<boolean>,
): void {
  const renderContext = {
    document: element.ownerDocument,
    vine,
  };
  const ctrl$ = defer(() => {
    return of(new registrationSpec.ctrl({
      element,
      host: createBindings(registrationSpec.spec.host ?? {}, element, renderContext),
      shadow: createShadowBindingObjects(registrationSpec.spec.shadow ?? {}, shadowRoot, renderContext),
      shadowRoot,
      vine,
    }));
  })
      .pipe(
          catchError(err => {
            // eslint-disable-next-line no-console
            console.error(err);
            return EMPTY;
          }),
          shareReplay({bufferSize: 1, refCount: false}),
      );

  combineLatest([
    ctrl$,
    isConnected$.pipe(
        switchMap(isConnected => {
          return isConnected ? of(true) : timer(CLEANUP_DELAY_MS).pipe(mapTo(false));
        }),
        distinctUntilChanged(),
    )])
      .pipe(
          switchMap(([ctrl, isConnected]) => {
            if (!isConnected) {
              return EMPTY;
            }

            const runs = $pipe(
                ctrl.runs,
                $map(run => run.pipe(
                    catchError(err => {
                      // eslint-disable-next-line no-console
                      console.warn(err);
                      return EMPTY;
                    }),
                )),
            );

            return merge(...runs);
          }),
      )
      .subscribe();
}

function createMethods(
    registrationSpec: RegistrationSpec<Spec>,
    element: HTMLElement,
): void {
  const methodRecord: Record<string, Function> = {};
  const spec = {
    ...(registrationSpec.spec ?? {}),
  };
  for (const key in spec.host) {
    const io = spec.host[key];
    if (io.apiType !== ApiType.CALL) {
      continue;
    }

    const value$ = new Subject<unknown>();
    methodRecord[io.methodName] = (arg: unknown) => {
      value$.next(arg);
    };
    setValueObservable(element, io.methodName, value$);
  }

  Object.assign(element, methodRecord);
}

function createProperties(
    registrationSpec: RegistrationSpec<Spec>,
    element: HTMLElement,
): void {
  const descriptor: Record<string, PropertyDescriptor> = {};
  const spec = {
    ...(registrationSpec.spec ?? {}),
  };
  for (const key in spec.host) {
    const io = spec.host[key];
    if (io.apiType !== ApiType.VALUE) {
      continue;
    }

    const value$ = new BehaviorSubject<unknown>(io.defaultValue);
    descriptor[io.key] = createDescriptorForProperty(io, value$);
    setValueObservable(element, io.key, value$);
  }

  Object.defineProperties(element, descriptor);
}


function createDescriptorForProperty<T>(
    io: IValue<T, string>|OValue<T, string>,
    value$: BehaviorSubject<T>,
): PropertyDescriptor {
  const getterDescriptor: PropertyDescriptor = {
    get(): unknown {
      return value$.getValue();
    },
  };

  if (io.ioType === IOType.OUTPUT) {
    return getterDescriptor;
  }

  return {
    ...getterDescriptor,
    set(value: unknown): void {
      if (!io.valueType.check(value)) {
        throw new Error(`Invalid value ${value} expected ${io.valueType}`);
      }

      value$.next(value);
    },
  };
}

function createShadow(
    registrationSpec: CustomElementRegistration<HTMLElement, Spec>,
    element: HTMLElement,
    vine: Vine,
): ShadowRoot {
  if (element.shadowRoot) {
    return element.shadowRoot;
  }
  const root = element.attachShadow({mode: 'open'});
  root.appendChild($getTemplate.get(vine)(registrationSpec).content.cloneNode(true));
  return root;
}

type ShadowBindingRecord = Record<string, ResolvedBindingSpecProvider<ResolvedBindingSpec, any>>;
function createShadowBindingObjects<O extends ShadowBindingRecord>(
    spec: O,
    shadowRoot: ShadowRoot,
    context: RenderContext,
): ShadowBindings<O> {
  const partial: Record<string, Bindings<BindingSpec, any>> = {};
  for (const key in spec) {
    partial[key] = createShadowBindings(spec[key], shadowRoot, context);
  }
  return partial as ShadowBindings<O>;
}

function createShadowBindings<S extends ResolvedBindingSpec>(
    spec: ResolvedBindingSpecProvider<S, any>,
    shadowRoot: ShadowRoot,
    context: RenderContext,
): Bindings<S, any> {
  const partial: Partial<Record<string, Observable<unknown>|OutputBinding<any, any, any[]>>> = {};
  for (const key in spec) {
    partial[key] = spec[key](shadowRoot, context);
  }
  return partial as Bindings<S, any>;
}