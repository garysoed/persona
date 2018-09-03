import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as vineGetOrRegisterApp } from 'grapevine/export/main';
import { retryUntil, should } from 'gs-testing/export/main';
import { IntegerParser } from 'gs-tools/export/parse';
import { NullableType, NumberType } from 'gs-types/export';
import { attribute } from '../locator/attribute-locator';
import { resolveLocators } from '../locator/resolve';
import { shadowHost } from '../locator/shadow-host-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { getOrRegisterApp } from '../main/persona';

const vineApp = vineGetOrRegisterApp('test');
const {builder: vineBuilder, vineIn} = vineApp;
const {builder: personaBuilder, customElement, render} = getOrRegisterApp('test', vineApp);

const template = '<div></div>';

const $testSource = staticSourceId('testsource', NumberType);
vineBuilder.source($testSource, 2);

const $ = resolveLocators({
  host: {
    attr: attribute(shadowHost, 'attr', IntegerParser, NullableType(NumberType), 0),
    attr2: attribute(shadowHost, 'attr2', IntegerParser, NullableType(NumberType), 0),
  },
});

/**
 * @test
 */
@customElement({
  shadowMode: 'open',
  tag: 'p-test',
  template,
  watch: [shadowHost],
})
// tslint:disable-next-line:no-unused-variable
class TestClass extends CustomElementCtrl {
  @render($.host.attr2) readonly attr2: number = 456;

  init(): void {
    // noop
  }

  @render($.host.attr)
  renderInteger(@vineIn($testSource) test: number): number {
    return test;
  }
}

// Runs persona and grapevine.
const vine = vineBuilder.run();
personaBuilder.build([TestClass], window.customElements, vine);

describe('annotation.render', () => {
  should(`update the element correctly`, async () => {
    const testElement = document.createElement('p-test');
    document.body.appendChild(testElement);

    // tslint:disable-next-line:no-non-null-assertion
    await retryUntil(() => testElement.getAttribute('attr')).to.equal('2');

    // Sets the new value.
    vine.setValue($testSource, 123);

    await retryUntil(() => testElement.getAttribute('attr')).to.equal('123');
    await retryUntil(() => testElement.getAttribute('attr2')).to.equal('456');
  });
});
