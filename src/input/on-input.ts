import { InstanceStreamId, instanceStreamId } from '@grapevine/component';
import { StringType } from 'gs-types/export';
import { fromEvent, Observable, SchedulerLike } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';

export class OnInputInput implements Input<string> {
  readonly id: InstanceStreamId<string>;

  constructor(
      private readonly debounceMs: number,
      private readonly options: AddEventListenerOptions,
      readonly resolver: (root: ShadowRoot) => Observable<HTMLInputElement>,
      private readonly scheduler?: SchedulerLike,
  ) {
    this.id = instanceStreamId(`onInput`, StringType);
  }

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
