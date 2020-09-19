import { assert, createSpySubject, should, test } from 'gs-testing';

import { createFakeContext } from '../testing/create-fake-context';

import { slotted } from './slotted';


test('@persona/main/slotted', () => {
  test('getValue', () => {
    should(`emit the element correctly`, () => {
      const id = 'id';
      const input = slotted(id, 1, {});
      const slotName = 'slotName';

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const slotEl = document.createElement('slot');
      slotEl.id = id;
      slotEl.name = slotName;
      shadowRoot.appendChild(slotEl);

      const el1 = document.createElement('div');
      el1.setAttribute('slot', slotName);
      root.appendChild(el1);

      const el2 = document.createElement('div');
      el2.setAttribute('slot', slotName);
      root.appendChild(el2);

      const spyElement$ = createSpySubject(input.getValue(createFakeContext({shadowRoot})));
      assert(spyElement$).to.emitWith(el2);
    });

    should(`throw error if the element is not an HTMLSlotElement`, () => {
      const id = 'id';
      const input = slotted(id, {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('input');
      el.id = id;
      shadowRoot.appendChild(el);

      assert(() => input.getValue(createFakeContext({shadowRoot})))
          .to.throwErrorWithMessage(/Element of/);
    });
  });
});
