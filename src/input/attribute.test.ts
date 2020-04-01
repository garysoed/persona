import { assert, should, test } from 'gs-testing';
import { integerConverter } from 'gs-tools/export/serializer';
import { instanceofType } from 'gs-types';
import { compose, human } from 'nabu';

import { element } from '../main/element';

import { attribute } from './attribute';


test('input.attribute', () => {
  const ELEMENT_ID = 'test';
  const ATTR_NAME = 'attr-name';

  test('getValue - default value', init => {
    const DEFAULT_VALUE = 123;
    const _ = init(() => {
      const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
        attr: attribute(
            ATTR_NAME,
            compose(integerConverter(), human()),
            DEFAULT_VALUE,
        ),
      });

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('div');
      el.id = ELEMENT_ID;
      shadowRoot.appendChild(el);

      const input = $._.attr;

      return {el, input, shadowRoot};
    });

    should(`create observable that emits attribute values`, () => {
      _.el.setAttribute(ATTR_NAME, '456');
      assert(_.input.getValue(_.shadowRoot)).to.emitWith(456);

      _.el.setAttribute(ATTR_NAME, '789');
      assert(_.input.getValue(_.shadowRoot)).to.emitWith(789);
    });

    should(
        `create observable that returns the default value if the element's attribute is missing`,
        async () => {
          assert(_.input.getValue(_.shadowRoot)).to.emitWith(DEFAULT_VALUE);
        });
  });

  test('getValue - no default value', init => {
    const _ = init(() => {
      const $ = element(ELEMENT_ID, instanceofType(HTMLDivElement), {
        attr: attribute(
            ATTR_NAME,
            compose(integerConverter(), human()),
        ),
      });

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('div');
      el.id = ELEMENT_ID;
      shadowRoot.appendChild(el);

      const input = $._.attr;

      return {el, input, shadowRoot};
    });

    should(`create observable that emits attribute values`, () => {
      _.el.setAttribute(ATTR_NAME, '456');
      assert(_.input.getValue(_.shadowRoot)).to.emitWith(456);

      _.el.setAttribute(ATTR_NAME, '789');
      assert(_.input.getValue(_.shadowRoot)).to.emitWith(789);
    });

    should(
        `create observable that returns undefined if the element's attribute is missing`,
        async () => {
          assert(_.input.getValue(_.shadowRoot)).to.emitWith(undefined);
        });
  });
});
