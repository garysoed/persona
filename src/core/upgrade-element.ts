import {Vine} from 'grapevine';
import {$map, $pipe} from 'gs-tools/export/collect';
import {BehaviorSubject, combineLatest, defer, EMPTY, merge, Observable, of, Subject, timer} from 'rxjs';
import {catchError, distinctUntilChanged, mapTo, shareReplay, switchMap} from 'rxjs/operators';

import {RenderContext} from '../render/types/render-context';
import {Bindings, BindingSpec, ResolvedBindingSpecProvider, ShadowBindings, Spec, UnresolvedBindingSpec} from '../types/ctrl';
import {ApiType, IOType, IValue, OValue} from '../types/io';
import {Registration, RegistrationSpec} from '../types/registration';
import {setValueObservable} from '../util/value-observable';

import {createBinding, createBindings, OutputBinding} from './create-bindings';
import {resolveForHost} from './resolve-for-host';
import {$getTemplate} from './templates-cache';


const CLEANUP_DELAY_MS = 1000;

type DecoratedHtmlElement = HTMLElement & {
  connectedCallback(): void;
  disconnectedCallback(): void;
};

export function upgradeElement(
    registration: Registration<HTMLElement, Spec>,
    element: DecoratedHtmlElement,
    isConnected$: Subject<boolean>,
    vine: Vine,
): void {
  const shadowRoot = createShadow(registration, element, vine);
  createProperties(registration, element);
  createMethods(registration, element);
  createCtrl(registration, element, shadowRoot, vine, isConnected$);
  Object.setPrototypeOf(element, registration.get(vine).prototype);
}

function createCtrl(
    registrationSpec: RegistrationSpec<Spec>,
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
      host: createBindings(
          resolveForHost(registrationSpec.spec.host ?? {}, element, renderContext),
      ),
      shadow: createShadowBindingObjects(
          registrationSpec.spec.shadow ?? {},
          shadowRoot,
          renderContext,
      ),
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
    registrationSpec: RegistrationSpec<Spec>,
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

type ShadowBindingRecord = Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
function createShadowBindingObjects<O extends ShadowBindingRecord>(
    spec: O,
    shadowRoot: ShadowRoot,
    context: RenderContext,
): ShadowBindings<O> {
  const partial: Record<string, Bindings<BindingSpec>> = {};
  for (const key in spec) {
    partial[key] = createShadowBindings(spec[key], shadowRoot, context);
  }
  return partial as ShadowBindings<O>;
}

function createShadowBindings<S extends UnresolvedBindingSpec>(
    spec: ResolvedBindingSpecProvider<S>,
    shadowRoot: ShadowRoot,
    context: RenderContext,
): Bindings<S> {
  const partial: Partial<Record<string, Observable<unknown>|OutputBinding>> = {};
  for (const key in spec) {
    partial[key] = createBinding(spec[key](shadowRoot, context));
  }
  return partial as Bindings<S>;
}