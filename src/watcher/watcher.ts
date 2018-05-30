import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';

/**
 * Exposes the value in the DOM to Typescript.
 */
export abstract class Watcher<T> {
  constructor(
      protected readonly sourceId_: InstanceSourceId<T>,
      protected readonly vine_: VineImpl) { }

  protected abstract getValue_(root: ShadowRoot): T;

  protected updateVine_(root: ShadowRoot, context: BaseDisposable): void {
    this.vine_.setValue(this.sourceId_, this.getValue_(root), context);
  }

  abstract watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction;
}
