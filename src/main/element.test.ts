import { assert, createSpySubject, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { element } from './element';

test('@persona/main/element', () => {
  test('getValue', () => {
    should(`emit the element correctly`, () => {
      const ID = 'id';
      const input = element(ID, instanceofType(HTMLDivElement), {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('div');
      el.id = ID;
      shadowRoot.appendChild(el);

      const spyElement$ = createSpySubject(input.getValue(shadowRoot));
      assert(spyElement$).to.emitWith(el);
    });

    should(`handle emitting the host element`, () => {
      const input = element({});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const spyElement$ = createSpySubject(input.getValue(shadowRoot));
      assert(spyElement$).to.emitWith(root);
    });

    should(`handle component specs`, () => {
      const ID = 'id';
      const tag = 'tag';
      const input = element(ID, {tag, api: {}}, {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement(tag);
      el.id = ID;
      shadowRoot.appendChild(el);

      const spyElement$ = createSpySubject(input.getValue(shadowRoot));
      assert(spyElement$).to.emitWith(el);
    });

    should(`throw error if the element is of the wrong type`, () => {
      const ID = 'id';
      const input = element(ID, instanceofType(HTMLDivElement), {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('input');
      el.id = ID;
      shadowRoot.appendChild(el);

      const spyElement$ = createSpySubject(input.getValue(shadowRoot));
      assert(spyElement$).to.emitErrorWithMessage(/Element of/);
    });
  });
});
