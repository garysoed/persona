import { assert, should, test } from '@gs-testing/main';
import { createSpySubject } from '@gs-testing/spy';
import { InstanceofType } from 'gs-types/export';
import { element } from './element';

test('input.element', () => {
  test('getValue', () => {
    should(`emit the element correctly`, () => {
      const ID = 'id';
      const input = element(ID, InstanceofType(HTMLDivElement), {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('div');
      el.id = ID;
      shadowRoot.appendChild(el);

      const spyElementSubject = createSpySubject(input.getValue(shadowRoot));
      assert(spyElementSubject.getValue()).to.equal(el);
    });

    should(`handle emitting the host element`, () => {
      const input = element({});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const spyElementSubject = createSpySubject(input.getValue(shadowRoot));
      assert(spyElementSubject.getValue()).to.equal(root);
    });

    should(`throw error if the element is of the wrong type`, () => {
      const ID = 'id';
      const input = element(ID, InstanceofType(HTMLDivElement), {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('input');
      el.id = ID;
      shadowRoot.appendChild(el);

      const spyElementSubject = createSpySubject(input.getValue(shadowRoot));
      assert(spyElementSubject.thrownError.message as string).to.match(/Element of/);
    });
  });
});
