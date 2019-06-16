import { cache } from '@gs-tools/data';
import { fromEvent, merge, Observable, Subject } from '@rxjs';
import { map, startWith } from '@rxjs/operators';

export interface RouteSpec<T> {
  path: string;
  type: T;
}

export interface Route<M, T extends keyof M> {
  payload: M[T];
  type: T;
}

export interface Routes {
  'MAIN': {};
  'PROJECT': {projectId: string};
}

type RoutesOf<M> = {[K in keyof M]: Route<M, K>}[keyof M];

export interface LocationSpec {
  [key: string]: {};
}

export class LocationService<M extends LocationSpec> {
  private readonly onPushState: Subject<{}> = new Subject();

  constructor(
      private readonly specs: Array<RouteSpec<keyof M>>,
      private readonly defaultPath: RoutesOf<M>,
      private readonly windowObj: Window,
  ) { }

  getLocation(): Observable<RoutesOf<M>> {
    return merge(
            fromEvent<PopStateEvent>(this.windowObj, 'popstate'),
            this.onPushState,
        )
        .pipe(
            map(() => this.windowObj.location.pathname),
            startWith(this.windowObj.location.pathname),
            map(location => {
              for (const spec of this.specs) {
                const result = parseLocation<M>(location, spec);
                if (result.success) {
                  return {payload: result.value, type: spec.type};
                }
              }

              this.goToPath(this.defaultPath.type, this.defaultPath.payload);

              return this.defaultPath;
            }),
        );
  }

  getLocationOfType<K extends keyof M>(type: K): Observable<Route<M, K>|null> {
    return this.getLocation()
        .pipe(map((location): Route<M, K>|null => {
          return location.type === type ? location as Route<M, K> : null;
        }));
  }

  goToPath<T extends keyof M>(type: T, payload: M[T]): void {
    const spec = this.getPathSpecMap().get(type);
    if (!spec) {
      throw new Error(`Spec for ${type} not found`);
    }

    let path = spec;
    for (const key in payload) {
      if (!payload.hasOwnProperty(key)) {
        continue;
      }

      path = path.replace(new RegExp(`:${key}\\??`), `${payload[key]}`);
    }

    this.windowObj.history.pushState({}, 'TODO', path);
    this.onPushState.next({});
  }

  @cache()
  private getPathSpecMap(): Map<keyof M, string> {
    const map = new Map<keyof M, string>();
    for (const {type, path} of this.specs) {
      map.set(type, path);
    }

    return map;
  }
}

interface SuccessResult<T> {
  success: true;
  value: T;
}

interface FailedResult {
  success: false;
}

type MatchResult<T> = SuccessResult<T>|FailedResult;

function parseLocation<M>(
    location: string,
    spec: RouteSpec<keyof M>): MatchResult<M[keyof M]> {
  const replacedSpec = spec.path.replace(
      /:([^\/?]+)(\??)/g,
      (_, key, optional) => {
        const match = optional ? '*' : '+';

        return `(?<${key}>[^/]${match})`;
      });
  const regex = new RegExp(`^${replacedSpec}$`);
  const match = location.match(regex);
  if (!match) {
    return {success: false};
  }

  return {success: true, value: (match as any)['groups']};
}
