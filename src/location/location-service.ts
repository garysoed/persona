import { Runnable } from 'gs-tools/export/rxjs';
import { Result } from 'nabu';
import { fromEvent, fromEventPattern, merge, Observable, Subject } from 'rxjs';
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

export class LocationService<S extends RouteSpec> extends Runnable {
  private readonly onGoToUrl$: Subject<string> = new Subject();
  private readonly onPushState$: Subject<{}> = new Subject();

  constructor(
      private readonly specs: S,
      private readonly defaultRoute: Route<S, keyof S>,
      private readonly window$: Observable<Window>,
  ) {
    super();
    this.addSetup(this.setupGoToPath());
  }

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
              map(location => this.parseLocation(location)),
              tap(route => {
                if (!route) {
                  this.goToPath(this.defaultRoute.type, this.defaultRoute.payload);
                }
              }),
              map(route => {
                return route || this.defaultRoute;
              }),
          );
        }),
    );
  }

  getLocationOfType<K extends keyof S>(type: K): Observable<Route<S, K>|null> {
    return this.getLocation()
        .pipe(
            map((location): Route<S, K>|null => {
              return location.type === type ? location as Route<S, K> : null;
            }),
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

  interceptLinks(eventTarget: EventTarget): Observable<unknown> {
    return fromEventPattern<Event>(
        handler => {
          eventTarget.addEventListener('click', handler);
        },
        handler => {
          eventTarget.removeEventListener('click', handler);
        },
    )
    .pipe(
        tap(event => {
          const target = event.target;
          if (!(target instanceof Node)) {
            return;
          }
          const anchorEl = findAnchorElement(target);
          if (!anchorEl) {
            return;
          }

          if (anchorEl.target === '_blank') {
            return;
          }

          // DO NOT use href param, as it has the base url appended.
          const href = anchorEl.getAttribute('href');
          const route = this.parseLocation(href || '');
          if (!route) {
            return;
          }
          event.preventDefault();
          this.goToPath(route.type, route.payload);
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

  private parseLocation(location: string): Route<S, keyof S>|null {
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

    return null;
  }

  private setupGoToPath(): Observable<unknown> {
    return this.onGoToUrl$
        .pipe(
            withLatestFrom(this.window$),
            tap(([url, windowObj]) => {
              windowObj.history.pushState({}, 'TODO', url);
              this.onPushState$.next({});
            }),
        );
  }
}

function findAnchorElement(node: Node): HTMLAnchorElement|null {
  if (node instanceof HTMLAnchorElement) {
    return node;
  }

  const parent = node.parentNode;
  return parent ? findAnchorElement(parent) : null;
}
