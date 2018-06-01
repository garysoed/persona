import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Parser } from 'gs-tools/export/parse';
import { Watcher } from './watcher';

/**
 * A subclass of MutationRecord.
 */
interface Record {
  attributeName: string | null;
  target: Node;
}

/**
 * Watches for attribute changes.
 */
export class AttributeWatcher<T> extends Watcher<T> {
  constructor(
      private readonly elementWatcher_: Watcher<HTMLElement | null>,
      private readonly elementSourceId_: InstanceSourceId<HTMLElement | null>,
      private readonly parser_: Parser<T>,
      private readonly attrName_: string,
      sourceId: InstanceSourceId<T>,
      vine: VineImpl) {
    super(sourceId, vine);
  }

  private updateVine_(records: Record[], context: BaseDisposable): void {
    for (const {attributeName, target} of records) {
      if (!attributeName) {
        continue;
      }

      if (!(target instanceof Element)) {
        continue;
      }

      const unparsedValue = target.getAttribute(attributeName);
      const parsedValue = this.parser_.parse(unparsedValue);
      if (parsedValue !== null) {
        this.vine_.setValue(this.sourceId_, parsedValue, context);
      }
    }
  }

  watch(root: ShadowRoot, context: BaseDisposable): DisposableFunction {
    const mutationObserver = new MutationObserver(records => this.updateVine_(records, context));
    const elementWatcherUnlisten = this.elementWatcher_.watch(root, context);
    const elementSourceUnlisten = this.vine_.listen(
        this.elementSourceId_,
        element => {
          if (element) {
            mutationObserver.observe(
                element,
                {
                  attributeFilter: [this.attrName_],
                  attributes: true,
                });
            this.updateVine_(
                [{attributeName: this.attrName_, target: element}],
                context);
          } else {
            mutationObserver.disconnect();
          }
        },
        context);

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
      elementWatcherUnlisten.dispose();
      elementSourceUnlisten();
    });
  }
}
