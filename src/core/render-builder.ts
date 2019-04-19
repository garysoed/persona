import { Source, Stream, Vine } from '@grapevine';
import { DelayedObservable } from 'grapevine/export/internal';
import { combineLatest, Observable } from 'rxjs';
import { Output } from '../component/output';
import { InitFn } from './types';

export class RenderBuilder<T> {
  constructor(private readonly outputs: Array<Output<T>>) {}

  with(sourceOrStream: Stream<T, any>|Source<T, any>): InitFn {
    return (vine: Vine, root: ShadowRoot) => {
      const runObs = this.outputs
          .map(output => output.output(root, sourceOrStream.get(vine)));

      return combineLatest(runObs);
    };
  }

  withObservable(obs: Observable<T>): InitFn {
    return (_vine: Vine, root: ShadowRoot) => {
      const runObs = this.outputs.map(output => {
        if (obs instanceof DelayedObservable) {
          throw new Error('DelayedObservable not allowed here');
        }

        return output.output(root, obs);
      });

      return combineLatest(runObs);
    };
  }
}
