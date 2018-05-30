import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Event } from 'gs-tools/export/event';
import { Listener } from '../listener/listener';

/**
 * Exposes the value in the DOM to Typescript.
 */
export abstract class Watcher<T> {
  constructor(protected readonly vine_: VineImpl) { }

  abstract watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction;
}
