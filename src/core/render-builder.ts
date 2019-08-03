import { Source, Stream, Vine } from '@grapevine';
import { combineLatest, Observable, of as observableOf } from '@rxjs';

import { InitFn } from '../types/init-fn';
import { Output } from '../types/output';

export class RenderBuilder<T> {
  constructor(private readonly outputs: Array<Output<T>>) {}

  withObservable(obs: Observable<T>): InitFn {
    return this.run(() => obs);
  }

  withValue(value: T): InitFn {
    return this.run(() => observableOf(value));
  }

  withVine(sourceOrStream: Stream<T, any>|Source<T, any>): InitFn {
    return this.run(vine => sourceOrStream.get(vine));
  }

  private run(handler: (vine: Vine, root: ShadowRoot) => Observable<T>): InitFn {
    return (vine: Vine, root: ShadowRoot) => {
      const runObs = this.outputs.map(output => output.output(root, handler(vine, root)));

      return combineLatest(runObs);
    };
  }
}
