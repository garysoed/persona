import {assert, should, test} from 'gs-testing';

import {applyAttributes} from './create-element-from-spec';

test('@persona/main/create-element-from-spec', () => {
  test('applyAttributes', () => {
    should('apply the attributes correctly', () => {
      const el = document.createElement('div');
      el.setAttribute('a', '1');
      el.setAttribute('b', '2');
      el.setAttribute('c', '3');

      applyAttributes(el, new Map([['b', '2'], ['c', '4'], ['d', '5']]));
      assert(el.getAttribute('a')).to.beNull();
      assert(el.getAttribute('b')).to.equal('2');
      assert(el.getAttribute('c')).to.equal('4');
      assert(el.getAttribute('d')).to.equal('5');
    });
  });
});
