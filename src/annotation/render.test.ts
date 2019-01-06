import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as vineGetOrRegisterApp } from 'grapevine/export/main';
import { retryUntil, should, test } from 'gs-testing/export/main';
import { integerConverter } from 'gs-tools/export/serializer';
import { NumberType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { attribute as attributeIn } from '../input/attribute';
import { element } from '../input/element';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { getOrRegisterApp } from '../main/persona';
import { attribute as attributeOut } from '../output/attribute';

const vineApp = vineGetOrRegisterApp('test');
const {builder: vineBuilder, vineIn} = vineApp;
const {builder: personaBuilder, customElement, render} = getOrRegisterApp('test', vineApp);

const integerParser = compose(integerConverter(), human());

const template = '<div></div>';

const $testSource = staticSourceId('testsource', NumberType);
vineBuilder.source($testSource, 2);

const $ = {
  host: element({
    attr: attributeOut('attr', integerParser),
    attr2: attributeIn('attr2', integerParser, NumberType, 123),
    attr3: attributeOut('attr3', integerParser),
    attr4: attributeOut('attr4', integerParser),
  }),
};

/**
 * @test
 */
@customElement({
  input: [
    $.host._.attr2,
  ],
  shadowMode: 'open',
  tag: 'p-test',
  template,
})
@render($.host._.attr3).withForwarding($.host._.attr2.id)
// tslint:disable-next-line:no-unused-variable
class TestClass extends CustomElementCtrl {
  @render($.host._.attr4) readonly attr4: number = 456;

  init(): void {
    // noop
  }

  @render($.host._.attr)
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
