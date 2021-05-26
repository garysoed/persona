import {assert, should, test} from 'gs-testing';

import {$div} from '../html/div';
import {attribute, AttributeInput} from '../input/attribute';
import {createFakeContext} from '../testing/create-fake-context';
import {integerParser} from '../util/parsers';

import {element} from './element';


test('@persona/selector/element', () => {
  test('getValue', () => {
    should('emit the element correctly', () => {
      const ID = 'id';
      const input = element(ID, $div, {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('div');
      el.id = ID;
      shadowRoot.appendChild(el);

      assert(input.getSelectable(createFakeContext({shadowRoot}))).to.equal(el);
    });

    should('handle component specs', () => {
      const ID = 'id';
      const tag = 'tag';
      const input = element(ID, {tag, api: {}}, {
        attr: attribute('attr-name', integerParser()),
        group: {
          attr: attribute('attr-name-2', integerParser()),
        },
      });

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement(tag);
      el.id = ID;
      shadowRoot.appendChild(el);

      assert(input.getSelectable(createFakeContext({shadowRoot}))).to.equal(el);
      assert(input._.attr).to.beAnInstanceOf(AttributeInput);
      assert(input._.group.attr).to.beAnInstanceOf(AttributeInput);
    });

    should('throw error if the element is of the wrong type', () => {
      const ID = 'id';
      const input = element(ID, $div, {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('input');
      el.id = ID;
      shadowRoot.appendChild(el);

      assert(() => input.getSelectable(createFakeContext({shadowRoot})))
          .to.throwErrorWithMessage(/Element of/);
    });
  });
});
