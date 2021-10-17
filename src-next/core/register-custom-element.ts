import {source} from 'grapevine';
import {BehaviorSubject, combineLatest, EMPTY, of, Subject, timer} from 'rxjs';
import {distinctUntilChanged, map, mapTo, shareReplay, switchMap} from 'rxjs/operators';

import {AttributeChangedEvent} from '../types/event';
import {IVariable, OVariable} from '../types/io';
import {Registration, RegistrationSpec} from '../types/registration';
import {HostInnerSpec, InternalInnerSpec, Spec} from '../types/spec';

import {upgradeElement} from './upgrade-element';


const CLEANUP_DELAY_MS = 1000;

interface Typeof<T> {
  new (): T;
  prototype: T;
}


type ApiReadable<A> = {
  [K in keyof A]: A[K] extends OVariable<infer T> ? T :
      A[K] extends IVariable<infer T> ? T : never;
}

type ApiReadonlyKeys<A> = {
  readonly [K in keyof A]: A[K] extends IVariable<unknown> ? never :
      A[K] extends OVariable<unknown> ? K : never;
}[keyof A];

type ApiReadonly<A> = Readonly<ApiReadable<Pick<A, ApiReadonlyKeys<A>>>>;

type ApiAsProperties<A> = ApiReadable<A>&ApiReadonly<A>;

export function registerCustomElement<
      H extends HostInnerSpec,
      S extends Spec<H, InternalInnerSpec>>(
    spec: RegistrationSpec<S>,
): Registration<Typeof<ApiAsProperties<H>&HTMLElement>> {
  const base = source(vine => {
    const elementClass = class extends HTMLElement {
      private readonly ctrl$ = timer(0).pipe(
          map(() => {
            return new spec.ctrl({element: this, vine});
          }),
          shareReplay({bufferSize: 1, refCount: false}),
      );

      private readonly isConnected$ = new BehaviorSubject(false);
      private readonly onAttributeChanged$ = new Subject<AttributeChangedEvent>();

      constructor() {
        super();
        upgradeElement(spec, this);
        this.run();
      }

      attributeChangedCallback(attrName: string): void {
        this.onAttributeChanged$.next({attrName});
      }

      connectedCallback(): void {
        this.isConnected$.next(true);
      }

      disconnectedCallback(): void {
        this.isConnected$.next(false);
      }

      private run(): void {
        const isConnected$ = this.isConnected$.pipe(
            switchMap(isConnected => {
              return isConnected ? of(true) : timer(CLEANUP_DELAY_MS).pipe(mapTo(false));
            }),
            distinctUntilChanged(),
        );

        combineLatest([this.ctrl$, isConnected$])
            .pipe(
                switchMap(([ctrl, isConnected]) => {
                  if (!isConnected) {
                    return EMPTY;
                  }

                  return ctrl.runs;
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

      static get observedAttributes(): readonly string[] {
        // TODO
        return [];
      }
    };

    return elementClass as unknown as Typeof<ApiAsProperties<H>&HTMLElement>;
  });

  return Object.assign(base,
      {
        ...spec,
        configure: spec.configure ?? (() => undefined),
      });
}