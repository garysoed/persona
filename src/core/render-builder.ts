import { Source, Stream, Vine } from '@grapevine';
import { combineLatest } from 'rxjs';
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
}
