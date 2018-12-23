import { assert, should, test } from 'gs-testing/export/main';
import { createSpySubject } from 'gs-testing/export/spy';
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

      const spyElementSubject = createSpySubject();
      input.getValue(shadowRoot).subscribe(spyElementSubject);

      assert(spyElementSubject.getValue()).to.equal(el);
    });

    should(`throw error if the element is of the wrong type`, () => {
      const ID = 'id';
      const input = element(ID, InstanceofType(HTMLDivElement), {});

      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const el = document.createElement('input');
      el.id = ID;
      shadowRoot.appendChild(el);

      const spyElementSubject = createSpySubject();
      input.getValue(shadowRoot).subscribe(spyElementSubject);

      assert(spyElementSubject.thrownError.message as string).to.match(/Element of/);
    });
  });
});
