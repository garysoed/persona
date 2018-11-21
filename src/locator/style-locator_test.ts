import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder } from 'grapevine/export/main';
import { retryUntil, should, test } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { InstanceofType, StringType } from 'gs-types/export';
import { element } from './element-locator';
import { ResolvedStyleLocator, style } from './style-locator';

test('locator.StyleLocator', () => {
  const elementLocator = element('#test(', InstanceofType(HTMLDivElement));
  let locator: ResolvedStyleLocator<'minHeight'>;

  beforeEach(() => {
    locator = style(elementLocator, 'minHeight');
  });

  should(`set the style correctly`, async () => {
    const context = new BaseDisposable();
    const vineBuilder = new VineBuilder();

    // Sets up the test source and stream.
    const testSourceId = instanceSourceId('test(', StringType);
    vineBuilder.source(testSourceId, '0');
    vineBuilder.stream(locator.getWritingId(), testValue => testValue, testSourceId);

    // Sets up the element locator.
    vineBuilder.source(elementLocator.getReadingId(), null);

    const vine = vineBuilder.run();
    locator.startRender(vine, context);

    const divElement = document.createElement('div');
    vine.setValue(elementLocator.getReadingId(), divElement, context);
    vine.setValue(testSourceId, '1rem', context);

    await retryUntil(() => divElement.style.minHeight).to.equal('1rem');
  });
});
