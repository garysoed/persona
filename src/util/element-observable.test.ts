import { assert, retryUntil, should, test } from '@gs-testing';
import { BehaviorSubject } from '@rxjs';
import { elementObservable } from './element-observable';

test('@persona/util/elementObservable', () => {
  // TODO: This test is broken since fake mutation observer is running.
  should.skip(`emit the elements correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    const addedEl = document.createElement('div');

    const elementSubject = new BehaviorSubject<HTMLElement|null>(null);
    // tslint:disable-next-line:no-non-null-assertion
    elementObservable(rootEl, rootEl => rootEl.querySelector('div')!).subscribe(elementSubject);

    assert(elementSubject.getValue()).to.beNull();

    rootEl.appendChild(addedEl);
    await retryUntil(() => elementSubject.getValue()).to.equal(addedEl);

    addedEl.remove();
    await retryUntil(() => elementSubject.getValue()).to.beNull();
  });
});
