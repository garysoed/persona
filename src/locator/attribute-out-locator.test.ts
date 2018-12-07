import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder } from 'grapevine/export/main';
import { retryUntil, should, test } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { integerConverter } from 'gs-tools/export/serializer';
import { InstanceofType, NumberType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { attributeOut, ResolvedAttributeOutLocator } from './attribute-out-locator';
import { element } from './element-locator';

test('locator.AttributeOutLocator', () => {
  const ATTR_NAME = 'attr';
  const elementLocator = element('div', InstanceofType(HTMLElement));
  let locator: ResolvedAttributeOutLocator<number>;

  beforeEach(() => {
    locator = attributeOut(
        elementLocator,
        ATTR_NAME,
        compose(integerConverter(), human()),
        NumberType,
    );
  });

  test('startRender', () => {
    should(`render the attribute correctly`, async () => {
      const context = new BaseDisposable();
      const vineBuilder = new VineBuilder();

      // Sets up the test source and stream.
      const testSourceId = instanceSourceId('test(', NumberType);
      vineBuilder.source(testSourceId, 0);
      vineBuilder.stream(locator.getWritingId(), testValue => testValue, testSourceId);

      // Sets up the element locator.
      vineBuilder.source(elementLocator.getReadingId(), null);

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      const divElement = document.createElement('div');
      vine.setValue(elementLocator.getReadingId(), divElement, context);
      vine.setValue(testSourceId, 123, context);

      await retryUntil(() => divElement.getAttribute(ATTR_NAME)).to.equal('123');
    });
  });
});
