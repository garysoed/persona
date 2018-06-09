import { staticSourceId } from 'grapevine/export/component';
import { getOrRegisterApp as vineGetOrRegisterApp } from 'grapevine/export/main';
import { should, waitFor } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { IntegerParser } from 'gs-tools/export/parse';
import { NullableType, NumberType } from 'gs-types/export';
import { attribute } from '../locator/attribute-locator';
import { resolveLocators } from '../locator/resolve';
import { shadowHost } from '../locator/shadow-host-locator';
import { getOrRegisterApp } from '../main/persona';

const vineApp = vineGetOrRegisterApp('test');
const {builder: vineBuilder, vineIn} = vineApp;
const {builder: personaBuilder, customElement, render, templates} =
    getOrRegisterApp('test', vineApp);

const templateKey = 'templateKey';
templates.addTemplate(templateKey, '<div></div>');

const $testSource = staticSourceId('testsource', NumberType);
vineBuilder.source($testSource, 2);

const $ = resolveLocators({
  host: {
    attr: attribute(
        shadowHost,
        'attr',
        IntegerParser,
        NullableType(NumberType)),
    },
});

/**
 * @test
 */
@customElement({
  shadowMode: 'open',
  tag: 'p-test',
  templateKey,
  watch: [shadowHost],
})
// tslint:disable-next-line:no-unused-variable
class TestClass extends BaseDisposable {
  @render($.host.attr)
  renderInteger(@vineIn($testSource) test: number): number {
    return test;
  }
}

// Runs persona and grapevine.
const vine = vineBuilder.run();
personaBuilder.build(window.customElements, vine);

describe('annotation.render', () => {
  should(`update the element correctly`, async () => {
    const testElement = document.createElement('p-test');
    document.body.appendChild(testElement);

    // tslint:disable-next-line:no-non-null-assertion
    await waitFor(() => testElement.getAttribute('attr')).to.be('2');

    // Sets the new value.
    vine.setValue($testSource, 123);

    await waitFor(() => testElement.getAttribute('attr')).to.be('123');
  });
});
