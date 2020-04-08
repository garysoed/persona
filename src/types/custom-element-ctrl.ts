import { source, stream } from 'grapevine';
import { Factory } from 'grapevine/export/internal';
import { Runnable } from 'gs-tools/export/rxjs';
import { Observable, Subject } from 'rxjs';

import { PersonaContext } from '../core/persona-context';

import { Input } from './input';
import { Output } from './output';


export type CustomElementCtrlCtor = new (context: PersonaContext) => CustomElementCtrl;

/**
 * Base class of all custom elements.
 */
export abstract class CustomElementCtrl extends Runnable {
  protected readonly shadowRoot = this.context.shadowRoot;
  protected readonly vine = this.context.vine;

  constructor(
      private readonly context: PersonaContext,
  ) {
    super();
  }

  protected declareInput<T>(input: Input<T>): Observable<T> {
    return stream<T, CustomElementCtrl>(
        (): Observable<T> => {
          return input.getValue(this.context.shadowRoot);
        },
        this,
    )
    .get(this.context.vine);
  }

  protected declareSubject<T>(factory: Factory<T, this>): Subject<T> {
    return source(factory, this).get(this.context.vine);
  }

  protected render<T>(outputs: Output<T>, value$: Observable<T>): void {
    this.addSetup(value$.pipe(outputs.output(this.shadowRoot)));
  }
}
