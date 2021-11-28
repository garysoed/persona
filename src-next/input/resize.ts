import {cache} from 'gs-tools/export/data';
import {fromEventPattern, Observable, of} from 'rxjs';
import {share, switchMap} from 'rxjs/operators';

import {Resolved, UnresolvedIO} from '../types/ctrl';
import {ApiType, IOType, IResize} from '../types/io';


class ResolvedIResize implements Resolved<UnresolvedIResize> {
  readonly apiType = ApiType.RESIZE;
  readonly ioType = IOType.INPUT;

  constructor(
    readonly target: HTMLElement,
  ) {}

  @cache()
  get value$(): Observable<ResizeObserverEntry> {
    return fromEventPattern<readonly ResizeObserverEntry[]>(
        handler => {
          const observer = new ResizeObserver(entries => handler(entries));
          observer.observe(this.target);

          return observer;
        },
        (_, observer: ResizeObserver) => observer.disconnect(),
    )
        .pipe(
            switchMap(entries => of(...entries)),
            share(),
        );
  }
}

export class UnresolvedIResize implements UnresolvedIO<IResize> {
  readonly apiType = ApiType.RESIZE;
  readonly ioType = IOType.INPUT;

  resolve(target: HTMLElement): ResolvedIResize {
    return new ResolvedIResize(target);
  }
}

export function iresize(): UnresolvedIResize {
  return new UnresolvedIResize();
}
