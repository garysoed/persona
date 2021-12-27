import {assert, should, test} from 'gs-testing';
import {BehaviorSubject} from 'rxjs';

import {getValueObservable, setValueObservable} from './value-observable';


test('@persona/src/util/value-observable', () => {
  test('getValueObservable', () => {
    should('return the correct observable', () => {
      const el = document.createElement('div');
      const obs = new BehaviorSubject(123);
      const key = 'key';
      setValueObservable(el, key, obs);

      assert(getValueObservable(el, key)).to.equal(obs);
    });

    should('return null if the observable doesn\'t exist', () => {
      const el = document.createElement('div');
      const obs = new BehaviorSubject(123);
      setValueObservable(el, 'key', obs);

      assert(getValueObservable(el, 'other')).to.beNull();
    });

    should('return null if the element has not been upgraded', () => {
      const el = document.createElement('div');

      assert(getValueObservable(el, 'key')).to.beNull();
    });
  });
});