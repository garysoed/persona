import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder } from 'grapevine/export/main';
import { retryUntil, should } from 'gs-testing/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType } from 'gs-types/export';
import { classlist, ResolvedClassListLocator } from './classlist-locator';
import { element } from './element-locator';

describe('locator.ClassListLocator', () => {
  const elementLocator = element('div', InstanceofType(HTMLElement));
  let locator: ResolvedClassListLocator;

  beforeEach(() => {
    locator = classlist(elementLocator);
  });

  describe('startRender', () => {
    should(`render the classes correctly`, async () => {
      const context = new BaseDisposable();
      const vineBuilder = new VineBuilder();

      // Sets up the test source and stream.
      const testSourceId = instanceSourceId(
          'test',
          InstanceofType<ImmutableSet<string>>(ImmutableSet));
      vineBuilder.source(testSourceId, ImmutableSet.of());
      vineBuilder.stream(locator.getWritingId(), testValue => testValue, testSourceId);

      // Sets up the element locator.
      vineBuilder.source(elementLocator.getReadingId(), null);

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      const divElement = document.createElement('div');
      vine.setValue(elementLocator.getReadingId(), divElement, context);
      vine.setValue(testSourceId, ImmutableSet.of(['a', 'b', 'c']), context);

      await retryUntil(() => divElement.getAttribute('class')).to.equal('a b c');
    });
  });
});