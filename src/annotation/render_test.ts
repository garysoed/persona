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
    attr: attribute(
        shadowHost,
        'attr',
        IntegerParser,
        NullableType(NumberType),
        123),
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
  init(): void {
    // noop
  }

  @render($.host.attr)
  renderInteger(@vineIn($testSource) test: number): number {
    return test;
  }
}

personaBuilder.register([TestClass], vineBuilder);

// Runs persona and grapevine.
const vine = vineBuilder.run();
personaBuilder.build(window.customElements, vine);

describe('annotation.render', () => {
  should(`update the element correctly`, async () => {
    const testElement = document.createElement('p-test');
    document.body.appendChild(testElement);

    // tslint:disable-next-line:no-non-null-assertion
    await retryUntil(() => testElement.getAttribute('attr')).to.equal('2');

    // Sets the new value.
    vine.setValue($testSource, 123);

    await retryUntil(() => testElement.getAttribute('attr')).to.equal('123');
  });
});
