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

  abstract watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction;
}
