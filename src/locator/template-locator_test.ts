import { VineImpl } from 'grapevine/export/main';
import { assert, match, retryUntil, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, resetCalls } from 'gs-testing/export/spy';
import { IntegerParser, StringParser } from 'gs-tools/export/parse';
import { InstanceofType, NullableType } from 'gs-types/export';
import { element } from './element-locator';
import { ResolvedTemplateLocator, template } from './template-locator';

interface TestInput {
  $a: string;
  $b: number;
}

describe('locator.TemplateLocator', () => {
  let locator: ResolvedTemplateLocator<TestInput>;

  beforeEach(() => {
    locator = template(
        element('template', NullableType(InstanceofType(HTMLTemplateElement))),
        {$a: StringParser, $b: IntegerParser});
  });

  describe('createTemplateFn_', () => {
    should(`return the correct template function`, () => {
      const templateEl = document.createElement('template');
      templateEl.innerHTML = `<div>$a$b</div>`;
      const el = locator['createTemplateFn_'](templateEl)({$a: 'a', $b: 2});
      // tslint:disable-next-line:no-non-null-assertion
      assert(el!.firstChild).to.beAnInstanceOf(HTMLDivElement);
      // tslint:disable-next-line:no-non-null-assertion
      assert((el!.firstChild as HTMLDivElement).innerText).to.equal(`a2`);
    });

    should(`return template function that returns null if there are no template elements`, () => {
      const el = locator['createTemplateFn_'](null)({$a: 'a', $b: 2});
      assert(el).to.beNull();
    });
  });

  describe('createWatcher', () => {
    should(`create watcher that reacts to changes`, async () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const vine = Mocks.object<VineImpl>('vine');
      const mockOnChange = createSpy('OnChange');

      const templateEl = document.createElement('template');
      templateEl.innerHTML = `<div>$a$b</div>`;

      shadowRoot.innerHTML = templateEl.outerHTML;

      const watcher = locator.createWatcher();
      watcher.watch(vine, mockOnChange, shadowRoot);

      // tslint:disable-next-line:no-non-null-assertion
      const docFragment = watcher.getValue(shadowRoot)({$a: 'a', $b: 2})!;
      assert((docFragment.firstChild as HTMLDivElement).innerText).to.equal('a2');

      await retryUntil(() => mockOnChange).to
          .equal(match.anySpyThat().haveBeenCalledWith(shadowRoot));

      resetCalls(mockOnChange);
      // Delete the template element.
      // tslint:disable-next-line:no-non-null-assertion
      shadowRoot.querySelector('template')!.remove();

      await retryUntil(() => mockOnChange).to
          .equal(match.anySpyThat().haveBeenCalledWith(shadowRoot));
    });
  });

  describe('getValue', () => {
    should(`return the correct template function`, () => {
      const templateEl = document.createElement('template');
      templateEl.innerHTML = `<div>$a$b</div>`;

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      shadowRoot.innerHTML = templateEl.outerHTML;

      const el = locator.getValue(shadowRoot)({$a: 'a', $b: 2});
      // tslint:disable-next-line:no-non-null-assertion
      assert(el!.firstChild).to.beAnInstanceOf(HTMLDivElement);
      // tslint:disable-next-line:no-non-null-assertion
      assert((el!.firstChild as HTMLDivElement).innerText).to.equal(`a2`);
    });
  });
});
