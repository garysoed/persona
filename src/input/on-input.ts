import { fromEvent, Observable, SchedulerLike } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Input } from '../types/input';
import { UnresolvedElementProperty } from '../types/unresolved-element-property';

export class OnInputInput implements Input<string> {
  constructor(
      private readonly debounceMs: number,
      private readonly options: AddEventListenerOptions,
      readonly resolver: (root: ShadowRoot) => Observable<HTMLInputElement>,
      private readonly scheduler?: SchedulerLike,
  ) { }

  getValue(root: ShadowRoot): Observable<string> {
    return this.resolver(root)
        .pipe(
            switchMap(el => {
              return fromEvent(el, 'input', this.options)
                  .pipe(
                      map(() => el.value),
                      debounceTime(this.debounceMs, this.scheduler),
                  );
            }),
        );
  }
}

class UnresolvedOnInputInput implements UnresolvedElementProperty<HTMLInputElement, OnInputInput> {
  constructor(
      private readonly debounceMs: number,
      private readonly options: AddEventListenerOptions,
      private readonly scheduler?: SchedulerLike,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<HTMLInputElement>): OnInputInput {
    return new OnInputInput(this.debounceMs, this.options, resolver, this.scheduler);
  }
}

export function onInput(
    debounceMs: number = 0,
    options: AddEventListenerOptions = {},
    scheduler?: SchedulerLike,
): UnresolvedOnInputInput {
  return new UnresolvedOnInputInput(debounceMs, options, scheduler);
}
