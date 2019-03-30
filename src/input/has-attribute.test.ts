import { assert, should, test } from '@gs-testing/main';
import { InstanceofType } from '@gs-types';
import { element } from './element';
import { hasAttribute, HasAttributeInput } from './has-attribute';

test('persona.input.hasAttribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  let input: HasAttributeInput;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      hasAttr: hasAttribute(ATTR_NAME),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.hasAttr;
  });

  test('getValue', () => {
    should(`create observable that emits true iff the attribute exists`, async () => {
      el.setAttribute(ATTR_NAME, '');
      await assert(input.getValue(shadowRoot)).to.emitWith(true);

      el.removeAttribute(ATTR_NAME);

      await assert(input.getValue(shadowRoot)).to.emitWith(false);
    });
  });
});
