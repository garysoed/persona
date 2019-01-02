import { assert, should, test } from 'gs-testing/export/main';
import { integerConverter } from 'gs-tools/export/serializer';
import { InstanceofType, NumberType } from 'gs-types/export';
import { human } from 'nabu/export/grammar';
import { compose } from 'nabu/export/util';
import { attribute, AttributeInput } from './attribute';
import { element } from './element';

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
          NumberType,
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
        () => {
          assert(input.getValue(shadowRoot)).to.emitWith(DEFAULT_VALUE);
        });
  });
});
