import { assert, should, test } from '@gs-testing';
import { integerConverter } from '@gs-tools/serializer';
import { InstanceofType } from '@gs-types';
import { compose, human } from '@nabu';
import { element } from '../main/element';
import { attribute, AttributeInput } from './attribute';

test('input.attribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';
  const DEFAULT_VALUE = 123;
  let input: AttributeInput<number>;
  let shadowRoot: ShadowRoot;
  let el: HTMLDivElement;

  beforeEach(() => {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLDivElement), {
      attr: attribute(
          ATTR_NAME,
          compose(integerConverter(), human()),
          DEFAULT_VALUE,
      ),
    });

    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('div');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    input = $._.attr;
  });

  test('getValue', () => {
    should(`create observable that emits attribute values`, async () => {
      el.setAttribute(ATTR_NAME, '456');
      await assert(input.getValue(shadowRoot)).to.emitWith(456);

      el.setAttribute(ATTR_NAME, '789');
      await assert(input.getValue(shadowRoot)).to.emitWith(789);
    });

    should(
        `create observable that returns the default value if the element's attribute is missing`,
        async () => {
          await assert(input.getValue(shadowRoot)).to.emitWith(DEFAULT_VALUE);
        });
  });
});
