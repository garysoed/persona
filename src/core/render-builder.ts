import { Source, Stream, stream } from 'grapevine';
import { Provider } from 'grapevine/export/internal';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Output } from '../types/output';

import { PersonaContext } from './persona-context';


export class RenderBuilder<T, C> {
  constructor(
      private readonly context: C,
      private readonly outputs: Array<Output<T>>,
      private readonly onDestroy$: Observable<unknown>,
      private readonly personaContext: PersonaContext,
  ) {}

  withFunction(renderFn: Provider<T, C>): void {
    return this.withVine(stream(renderFn, this.context));
  }

  withObservable(obs: Observable<T>): void {
    return this.run(obs);
  }

  withValue(value: T): void {
    return this.run(observableOf(value));
  }

  withVine(sourceOrStream: Stream<T, any>|Source<T, any>): void {
    return this.run(sourceOrStream.get(this.personaContext.vine));
  }

  private run(value$: Observable<T>): void {
    const runObs = this.outputs
        .map(output => output.output(this.personaContext.shadowRoot, value$));

    combineLatest(runObs).pipe(takeUntil(this.onDestroy$)).subscribe();
  }
}
