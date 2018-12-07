import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as vineGetOrRegisterApp } from 'grapevine/export/main';
import { retryUntil, should, test } from 'gs-testing/export/main';
import { integerConverter } from 'gs-tools/export/serializer';
import { NullableType, NumberType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { attributeIn } from '../locator/attribute-in-locator';
import { attributeOut } from '../locator/attribute-out-locator';
import { resolveLocators } from '../locator/resolve';
import { shadowHost } from '../locator/shadow-host-locator';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { getOrRegisterApp } from '../main/persona';

const vineApp = vineGetOrRegisterApp('test');
const {builder: vineBuilder, vineIn} = vineApp;
const {builder: personaBuilder, customElement, render} = getOrRegisterApp('test', vineApp);

const integerParser = compose(integerConverter(), human());

const template = '<div></div>';

const $testSource = staticSourceId('testsource', NumberType);
vineBuilder.source($testSource, 2);

const $ = resolveLocators({
  host: {
    attr: attributeOut(shadowHost, 'attr', integerParser, NullableType(NumberType)),
    attr2: attributeIn(shadowHost, 'attr2', integerParser, NullableType(NumberType), 123),
    attr3: attributeOut(shadowHost, 'attr3', integerParser, NullableType(NumberType)),
    attr4: attributeOut(shadowHost, 'attr4', integerParser, NullableType(NumberType)),
  },
});

/**
 * @test
 */
@customElement({
  shadowMode: 'open',
  tag: 'p-test',
  template,
  watch: [shadowHost, $.host.attr2],
})
@render($.host.attr3).withForwarding($.host.attr2)
// tslint:disable-next-line:no-unused-variable
class TestClass extends CustomElementCtrl {
  @render($.host.attr4) readonly attr4: number = 456;

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
personaBuilder.build(['p-test'], window.customElements, vine);

test('annotation.render', () => {
  should(`update the element correctly`, async () => {
    const testElement = document.createElement('p-test');
    document.body.appendChild(testElement);

    // tslint:disable-next-line:no-non-null-assertion
    await retryUntil(() => testElement.getAttribute('attr')).to.equal('2');

    // Sets the new value.
    vine.setValue($testSource, 123);
    testElement.setAttribute('attr2', '456');

    await retryUntil(() => testElement.getAttribute('attr')).to.equal('123');
    await retryUntil(() => testElement.getAttribute('attr3')).to.equal('456');
    await retryUntil(() => testElement.getAttribute('attr4')).to.equal('456');
  });
});
