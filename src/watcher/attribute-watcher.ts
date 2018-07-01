import { InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { DisposableFunction } from 'gs-tools/export/dispose';
import { Parser } from 'gs-tools/export/parse';
import { Type } from 'gs-types/export';
import { Handler, Watcher } from './watcher';

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
      private readonly elementWatcher_: Watcher<HTMLElement|null>,
      private readonly parser_: Parser<T>,
      private readonly type_: Type<T>,
      private readonly attrName_: string,
      sourceId: InstanceSourceId<T>) {
    super();
  }

  protected startWatching_(
      vineImpl: VineImpl,
      onChange: Handler<T>,
      root: ShadowRoot): DisposableFunction {
    const mutationObserver = new MutationObserver(records => this.updateVine_(records, onChange));
    const elementUnwatch = this.elementWatcher_.watch(
        vineImpl,
        newElement => {
          if (newElement) {
            mutationObserver.observe(
                newElement,
                {
                  attributeFilter: [this.attrName_],
                  attributes: true,
                });
            this.updateVine_(
                [{attributeName: this.attrName_, target: newElement}],
                onChange);
          } else {
            mutationObserver.disconnect();
          }
        },
        root);

    return DisposableFunction.of(() => {
      mutationObserver.disconnect();
      elementUnwatch.dispose();
    });
  }

  private updateVine_(records: Record[], onChange: Handler<T>): void {
    for (const {attributeName, target} of records) {
      if (!attributeName) {
        continue;
      }

      if (!(target instanceof Element)) {
        continue;
      }

      const unparsedValue = target.getAttribute(attributeName);
      const parsedValue = this.parser_.parse(unparsedValue);
      if (this.type_.check(parsedValue)) {
        onChange(parsedValue);
      }
    }
  }
}
