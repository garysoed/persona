import { filterNonNull, setup } from 'gs-tools/export/rxjs';
import { Result } from 'nabu';
import { fromEvent, merge, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { LocationConverter } from './location-converter';


export interface RouteSpec {
  readonly [key: string]: LocationConverter<unknown>;
}

type Payloads<R extends RouteSpec> = {
  [K in keyof R]: R[K] extends LocationConverter<infer T> ? T : never
};

export interface Route<S extends RouteSpec, K extends keyof S> {
  readonly payload: Payloads<S>[K];
  readonly type: K;
}

export class LocationService<S extends RouteSpec> {
  private readonly onGoToUrl$: Subject<string> = new Subject();
  private readonly onPushState$: Subject<{}> = new Subject();

  constructor(
      private readonly specs: S,
      private readonly defaultRoute: Route<S, keyof S>,
      private readonly window$: Observable<Window>,
  ) { }

  getLocation(): Observable<Route<S, keyof S>> {
    return this.window$.pipe(
        switchMap(windowObj => {
          return merge(
              fromEvent<PopStateEvent>(windowObj, 'popstate'),
              this.onPushState$,
          )
          .pipe(
              map(() => windowObj.location.pathname),
              startWith(windowObj.location.pathname),
              map(location => {
                for (const specKey of Object.keys(this.specs) as Array<keyof S>) {
                  const spec = this.specs[specKey];
                  const result = spec.convertForward(location) as Result<Payloads<S>[keyof S]>;
                  if (result.success) {
                    return {
                      payload: result.result,
                      type: specKey,
                    };
                  }
                }

                this.goToPath(this.defaultRoute.type, this.defaultRoute.payload);
                return this.defaultRoute;
              }),
          );
        }),
    );
  }

  getLocationOfType<K extends keyof S>(type: K): Observable<Route<S, K>> {
    return this.getLocation()
        .pipe(
            map((location): Route<S, K>|null => {
              return location.type === type ? location as Route<S, K> : null;
            }),
            filterNonNull(),
        );
  }

  goToPath<K extends keyof S>(type: K, payload: Payloads<S>[K]): void {
    const url = this.getUrl(type, payload)
        || this.getUrl(this.defaultRoute.type, this.defaultRoute.payload);
    if (!url) {
      throw new Error(`Invalid route: ${JSON.stringify({type, payload})}`);
    }

    this.onGoToUrl$.next(url);
  }

  @setup()
  get setupGoToPath(): Observable<unknown> {
    return this.onGoToUrl$
        .pipe(
            withLatestFrom(this.window$),
            tap(([url, windowObj]) => {
              windowObj.history.pushState({}, 'TODO', url);
              this.onPushState$.next({});
            }),
        );
  }


  private getUrl<K extends keyof S>(type: K, payload: Payloads<S>[K]): string|null {
    const result = this.specs[type].convertBackward(payload);
    if (!result.success) {
      return null;
    }

    return result.result;
  }
}
