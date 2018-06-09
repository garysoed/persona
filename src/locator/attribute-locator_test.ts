import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder } from 'grapevine/export/main';
import { should, waitFor } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { IntegerParser } from 'gs-tools/export/parse';
import { InstanceofType, NumberType } from 'gs-types/export';
import { attribute, ResolvedAttributeLocator } from './attribute-locator';
import { element } from './element-locator';

describe('locator.AttributeLocator', () => {
  const ATTR_NAME = 'attr';
  const elementLocator = element('element', InstanceofType(HTMLElement));
  let locator: ResolvedAttributeLocator<number>;

  beforeEach(() => {
    locator = attribute(elementLocator, ATTR_NAME, IntegerParser, NumberType);
  });

  describe('startRender', () => {
    should(`render the attribute correctly`, async () => {
      const context = new BaseDisposable();
      const vineBuilder = new VineBuilder();

      // Sets up the test source and stream.
      const testSourceId = instanceSourceId('test', NumberType);
      vineBuilder.source(testSourceId, 0);
      vineBuilder.stream(locator.getStreamId(), testValue => testValue, testSourceId);

      // Sets up the element locator.
      vineBuilder.source(elementLocator.getSourceId(), null);

      // Sets up the attribute locator.
      locator.setupVine(vineBuilder);

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      const divElement = document.createElement('div');
      vine.setValue(elementLocator.getSourceId(), divElement, context);
      vine.setValue(testSourceId, 123, context);

      await waitFor(() => divElement.getAttribute(ATTR_NAME)).to.be('123');
    });
  });
});
