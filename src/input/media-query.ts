import { instanceStreamId, InstanceStreamId } from '@grapevine/component';
import { BooleanType } from 'gs-types/export';
import { fromEvent, Observable } from 'rxjs';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { Input } from '../component/input';

export class MediaQueryInput implements Input<boolean> {
  readonly id: InstanceStreamId<boolean>;

  constructor(
      readonly query: string,
      private readonly window: Window,
  ) {
    this.id = instanceStreamId(`@mediaQuery ${this.query}`, BooleanType);
  }

  getValue(): Observable<boolean> {
    const mediaQuery = this.window.matchMedia(this.query);

    return fromEvent(mediaQuery, 'change')
        .pipe(
            map(() => mediaQuery.matches),
            startWith(mediaQuery.matches),
            shareReplay(1),
        );
  }
}

export function mediaQuery(query: string, windowObj: Window = window): MediaQueryInput {
  return new MediaQueryInput(query, windowObj);
}
