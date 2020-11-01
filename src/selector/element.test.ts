import { assert, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { createFakeContext } from '../testing/create-fake-context';

import { element } from './element';


test('@persona/selector/element', () => {
  test('getValue', () => {
    should('emit the element correctly', () => {
      const ID = 'id';
      const input = element(ID, instanceofType(HTMLDivElement), {});

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
      const input = element(ID, {tag, api: {}}, {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement(tag);
      el.id = ID;
      shadowRoot.appendChild(el);

      assert(input.getSelectable(createFakeContext({shadowRoot}))).to.equal(el);
    });

    should('throw error if the element is of the wrong type', () => {
      const ID = 'id';
      const input = element(ID, instanceofType(HTMLDivElement), {});

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
