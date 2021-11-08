import {Vine} from 'grapevine';
import {$map, $pipe} from 'gs-tools/export/collect';
import {BehaviorSubject, combineLatest, defer, EMPTY, merge, Observable, of, OperatorFunction, Subject, timer} from 'rxjs';
import {catchError, distinctUntilChanged, mapTo, shareReplay, switchMap} from 'rxjs/operators';

import {Bindings, BindingSpec, Resolved, ResolvedBindingSpec, ResolvedBindingSpecProvider, ResolvedI, ResolvedO, ShadowBindings, Spec, UnresolvedBindingSpec} from '../types/ctrl';
import {ApiType, InputOutput, IOType, IValue, OValue} from '../types/io';
import {Registration, RegistrationSpec} from '../types/registration';
import {setValueObservable} from '../util/value-observable';

import {$getTemplate} from './templates-cache';


const CLEANUP_DELAY_MS = 1000;

type DecoratedHtmlElement = HTMLElement & {
  connectedCallback(): void;
  disconnectedCallback(): void;
};

export function upgradeElement(
    registration: Registration<HTMLElement, Spec>,
    element: HTMLElement,
    vine: Vine,
): DecoratedHtmlElement {
  const isConnected$ = new BehaviorSubject(false);
  const decoratedEl = setupConnection(element, isConnected$);
  const shadowRoot = createShadow(registration, element, vine);
  createProperties(registration, element);
  createCtrl(registration, element, shadowRoot, vine, isConnected$);
  Object.setPrototypeOf(element, registration.get(vine).prototype);

  return decoratedEl;
}

function createCtrl(
    registrationSpec: RegistrationSpec<Spec>,
    element: HTMLElement,
    shadowRoot: ShadowRoot,
    vine: Vine,
    isConnected$: Observable<boolean>,
): void {
  const ctrl$ = defer(() => {
    return of(new registrationSpec.ctrl({
      element,
      host: createBindings(
          resolveForHost(registrationSpec.spec.host, element),
      ),
      shadow: createShadowBindingObjects(registrationSpec.spec.shadow, shadowRoot),
      vine,
    }));
  })
      .pipe(shareReplay({bufferSize: 1, refCount: false}));

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
                    // TODO: Log error
                    catchError(() => EMPTY),
                )),
            );

            return merge(...runs);
            // const onAttributeChanged$ = this.onAttributeChanged$.pipe(
            //     tap(({attrName}) => {
            //       ctrl.attributeChangedCallback(attrName);
            //     }),
            // );

          // return merge(onRun$, onAttributeChanged$);
          }),
      )
      .subscribe();
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
    descriptor[key] = createDescriptor(io, value$);
    setValueObservable(element, key, value$);
  }

  Object.defineProperties(element, descriptor);
}


function createDescriptor<T>(
    io: IValue<T>|OValue<T>,
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
  const root = element.attachShadow({mode: 'open'});
  root.appendChild($getTemplate.get(vine)(registrationSpec).content.cloneNode(true));
  return root;
}

function setupConnection(
    element: HTMLElement,
    isConnected$: Subject<boolean>,
): DecoratedHtmlElement {
  return Object.assign(
      element,
      {
        connectedCallback(): void {
          isConnected$.next(true);
        },

        disconnectedCallback(): void {
          isConnected$.next(false);
        },
      },
  );
}


function resolveForHost<S extends UnresolvedBindingSpec>(
    spec: S,
    target: HTMLElement,
): ResolvedBindingSpec<S> {
  const bindings: Partial<Record<keyof S, Resolved<unknown, InputOutput>>> = {};
  for (const key in spec) {
    const io = spec[key];
    if (io.apiType !== ApiType.VALUE) {
      continue;
    }

    bindings[key] = io.resolve(target);
  }
  return bindings as ResolvedBindingSpec<S>;
}

function createBindings<S extends UnresolvedBindingSpec>(spec: ResolvedBindingSpec<S>): Bindings<S> {
  const bindings: Partial<Bindings<BindingSpec>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = createBinding(io);
  }
  return bindings as Bindings<S>;
}

function createBinding<T>(io: ResolvedI<T>): Observable<T>;
function createBinding<T>(io: ResolvedO<T>): () => OperatorFunction<T, unknown>;
function createBinding(io: ResolvedI<unknown>|ResolvedO<unknown>): Observable<unknown>|(() => OperatorFunction<unknown, unknown>);
function createBinding(io: ResolvedI<unknown>|ResolvedO<unknown>): Observable<unknown>|(() => OperatorFunction<unknown, unknown>) {
  switch (io.apiType) {
    case ApiType.VALUE:
      switch (io.ioType) {
        // TODO(#8): Remove casts, only breaks outside VSCode
        case IOType.INPUT:
          return (io as ResolvedI<unknown>).value$;
        case IOType.OUTPUT:
          return () => (io as ResolvedO<unknown>).update();
      }
  }
}

type ShadowBindingRecord = Record<string, ResolvedBindingSpecProvider<UnresolvedBindingSpec>>;
function createShadowBindingObjects<O extends ShadowBindingRecord>(
    spec: O,
    shadowRoot: ShadowRoot,
): ShadowBindings<O> {
  const partial: Record<string, Bindings<BindingSpec>> = {};
  for (const key in spec) {
    partial[key] = createShadowBindings(spec[key], shadowRoot);
  }
  return partial as ShadowBindings<O>;
}

function createShadowBindings<S extends UnresolvedBindingSpec>(
    spec: ResolvedBindingSpecProvider<S>,
    shadowRoot: ShadowRoot,
): Bindings<S> {
  const partial: Partial<Bindings<BindingSpec>> = {};
  for (const key in spec) {
    partial[key] = createBinding(spec[key](shadowRoot));
  }
  return partial as Bindings<S>;
}