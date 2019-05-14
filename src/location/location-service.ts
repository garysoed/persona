import { cache } from '@gs-tools/data';
import { fromEvent, Observable } from '@rxjs';
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

type RoutesOf<M> = {[K in keyof M]: {payload: M[K]; type: K}}[keyof M];

export class LocationService<M> {
  constructor(
      private readonly specs: Array<RouteSpec<keyof M>>,
      private readonly defaultPath: RoutesOf<M>,
      private readonly windowObj: Window = window,
  ) { }

  getLocation(): Observable<RoutesOf<M>> {
    return fromEvent<PopStateEvent>(this.windowObj, 'popstate')
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

      path = path.replace(`:${key}`, payload[key].toString());
    }

    this.windowObj.history.pushState({}, 'TODO', path);
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