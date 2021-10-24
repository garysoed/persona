import {Vine} from 'grapevine';
import {$map, $pipe} from 'gs-tools/export/collect';
import {BehaviorSubject, combineLatest, defer, EMPTY, merge, Observable, of, Subject, timer} from 'rxjs';
import {catchError, distinctUntilChanged, mapTo, shareReplay, switchMap} from 'rxjs/operators';

import {Bindings, BindingSpec, Resolved, ResolvedBinding, Spec, UnresolvedBindingSpec} from '../types/ctrl';
import {ApiType, InputOutput, IOType, IValue, OValue} from '../types/io';
import {RegistrationSpec} from '../types/registration';
import {setValueObservable} from '../util/value-observable';


const CLEANUP_DELAY_MS = 1000;

type DecoratedHtmlElement = HTMLElement & {
  connectedCallback(): void;
  disconnectedCallback(): void;
};

export function upgradeElement(
    registrationSpec: RegistrationSpec<Spec>,
    element: HTMLElement,
    vine: Vine,
): DecoratedHtmlElement {
  const isConnected$ = new BehaviorSubject(false);
  const decoratedEl = setupConnection(element, isConnected$);
  createProperties(registrationSpec, element);
  createCtrl(registrationSpec, element, vine, isConnected$);
  return decoratedEl;
}

function createCtrl(
    registrationSpec: RegistrationSpec<Spec>,
    element: HTMLElement,
    vine: Vine,
    isConnected$: Observable<boolean>,
): void {
  const ctrl$ = defer(() => {
    return of(new registrationSpec.ctrl({
      element,
      host: createBindings(
          resolveForHost(registrationSpec.spec.host, element),
      ),
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
    internal: {},
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
): ResolvedBinding<S> {
  const bindings: Partial<Record<keyof S, Resolved<unknown, InputOutput>>> = {};
  for (const key in spec) {
    const io = spec[key];
    if (io.apiType !== ApiType.VALUE) {
      continue;
    }

    switch (io.ioType) {
      case IOType.INPUT:
        bindings[key] = io.resolve(target);
    }
  }
  return bindings as ResolvedBinding<S>;
}

function createBindings<S extends UnresolvedBindingSpec>(spec: ResolvedBinding<S>): Bindings<S> {
  const bindings: Partial<Bindings<BindingSpec>> = {};
  for (const key in spec) {
    const io = spec[key];
    if (io.apiType !== ApiType.VALUE) {
      continue;
    }

    switch (io.ioType) {
      case IOType.INPUT:
        bindings[key] = io.value$;
        break;
    }
  }
  return bindings as Bindings<S>;
}