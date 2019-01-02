import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder } from 'grapevine/export/main';
import { retryUntil, should, test } from 'gs-testing/export/main';
import { Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType, StringType } from 'gs-types/export';
import { element } from './element-locator';
import { ResolvedTextContentLocator, textContent } from './text-content-locator';

test('locator.TextContentLocator', () => {
  const elementLocator = element('div', InstanceofType(HTMLDivElement));
  let locator: ResolvedTextContentLocator;

  beforeEach(() => {
    locator = textContent(elementLocator);
  });

  test('startRender', () => {
    should(`render the content correctly`, async () => {
      const context = new BaseDisposable();
      const vineBuilder = new VineBuilder(Annotations.of(Symbol('test')));

      // Sets up the text source and stream.
      const testSourceId = instanceSourceId('test(', StringType);
      const text = 'text';
      vineBuilder.source(testSourceId, text);
      vineBuilder.stream(locator.getWritingId(), renderedText => renderedText, testSourceId);

      // Sets up the element locator.
      vineBuilder.source(elementLocator.getReadingId(), null);

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      const divEl = document.createElement('div');
      vine.setValue(elementLocator.getReadingId(), divEl, context);

      await retryUntil(() => divEl.textContent).to.equal(text);
    });
  });
});