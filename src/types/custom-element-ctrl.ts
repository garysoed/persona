import { source, stream, Vine } from 'grapevine';
import { Factory } from 'grapevine/export/internal';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Observable, Subject } from 'rxjs';

import { RenderBuilder } from '../core/render-builder';

import { Input } from './input';
import { Output } from './output';

export type CustomElementCtrlCtor = new (root: ShadowRoot, vine: Vine) => CustomElementCtrl;

/**
 * Base class of all custom elements.
 */
export abstract class CustomElementCtrl extends BaseDisposable {
  constructor(
      protected readonly shadowRoot: ShadowRoot,
      protected readonly vine: Vine,
  ) {
    super();
  }

  protected declareInput<T>(input: Input<T>): Observable<T> {
    return stream<T, CustomElementCtrl>(
        (): Observable<T> => {
          return input.getValue(this.shadowRoot);
        },
        this,
    )
    .get(this.vine);
  }

  protected declareSubject<T>(factory: Factory<T, this>): Subject<T> {
    return source(factory, this).get(this.vine);
  }

  protected render<T>(...outputs: Array<Output<T>>): RenderBuilder<T, this> {
    return new RenderBuilder(this, outputs, this.shadowRoot, this.vine, this.onDispose$);
  }
}
