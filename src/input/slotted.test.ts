import {arrayThat, assert, createSpySubject, should, test} from 'gs-testing';

import {$slot} from '../html/slot';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {slotted} from './slotted';


test('@persona/main/slotted', () => {
  test('getValue', () => {
    should('emit the element correctly', () => {
      const id = 'id';
      const $ = element(id, $slot, {
        slot: slotted(),
      });
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

      const spyElement$ = createSpySubject($._.slot.getValue(createFakeContext({shadowRoot})));
      assert(spyElement$).to.emitWith(arrayThat<Node>().haveExactElements([el1, el2]));
    });
  });
});
