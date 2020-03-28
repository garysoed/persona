import { source, stream, Vine } from 'grapevine';
import { Factory } from 'grapevine/export/internal';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Observable, Subject } from 'rxjs';

import { PersonaContext } from '../core/persona-context';
import { RenderBuilder } from '../core/render-builder';

import { Input } from './input';
import { Output } from './output';

export type CustomElementCtrlCtor = new (context: PersonaContext) => CustomElementCtrl;

/**
 * Base class of all custom elements.
 */
export abstract class CustomElementCtrl extends BaseDisposable {
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

  protected render<T>(...outputs: Array<Output<T>>): RenderBuilder<T, this> {
    return new RenderBuilder(this, outputs, this.onDispose$, this.context);
  }
}
