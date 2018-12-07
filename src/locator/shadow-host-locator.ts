import { instanceSourceId } from 'grapevine/export/component';
import { ImmutableSet } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { Errors } from 'gs-tools/src/error';
import { InstanceofType } from 'gs-types/export';
import { Observable, of as observableOf } from 'rxjs';
import { ResolvedWatchableLocator } from './resolved-locator';

const htmlElementType = InstanceofType(HTMLElement);

/**
 * Locates the shadow host.
 */
class ShadowHostLocatorImpl extends ResolvedWatchableLocator<HTMLElement> {
  constructor() {
    super(instanceSourceId('.host', htmlElementType));
  }

  getDependencies(): ImmutableSet<ResolvedWatchableLocator<any>> {
    return ImmutableSet.of([]);
  }

  @cache()
  getObservableValue(root: ShadowRoot): Observable<HTMLElement> {
    return observableOf(this.getValue(root));
  }

  getValue(root: ShadowRoot): HTMLElement {
    const host = root.host;
    if (!(host instanceof HTMLElement)) {
      throw Errors.assert('host element').shouldBeAnInstanceOf(HTMLElement).butWas(host);
    }

    return host;
  }

  toString(): string {
    return ':host';
  }
}

export const shadowHost = new ShadowHostLocatorImpl();
