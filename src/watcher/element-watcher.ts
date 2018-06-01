import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Errors } from 'gs-tools/export/error';
import { Type } from 'gs-types/export';
import { Watcher } from './watcher';

/**
 * Exposes HTMLElement in DOM to Typescript.
 */
export class ElementWatcher<T extends HTMLElement | null> extends Watcher<T> {
  constructor(
      private readonly selectorString_: string,
      private readonly type_: Type<T>,
      sourceId: InstanceSourceId<T>,
      vine: VineImpl) {
    super(sourceId, vine);
  }

  private getValue_(root: ShadowRoot): T {
    const selectorString = this.selectorString_;
    const type = this.type_;
    const el = root.querySelector(selectorString);
    if (!type.check(el)) {
      throw Errors.assert(`Element of [${selectorString}]`).shouldBeA(type).butWas(el);
    }

    return el;
  }

  private updateVine_(root: ShadowRoot, context: BaseDisposable): void {
    this.vine_.setValue(this.sourceId_, this.getValue_(root), context);
  }

  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    const mutationObserver = new MutationObserver(records => {
      if (records.length > 0) {
        this.updateVine_(root, context);
      }
    });
    mutationObserver.observe(root, {childList: true, subtree: true});
    this.updateVine_(root, context);

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
    });
  }
}
