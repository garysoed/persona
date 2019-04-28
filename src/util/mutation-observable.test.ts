import { assert, retryUntil, should, test } from '@gs-testing/main';
import { BehaviorSubject } from '@rxjs';
import { mutationObservable } from './mutation-observable';

test('util.mutationObservable', () => {
  should(`emit the records correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    const addedEl = document.createElement('div');

    const recordsSubject = new BehaviorSubject<MutationRecord[]|null>(null);
    mutationObservable(rootEl, {childList: true}).subscribe(recordsSubject);

    assert(recordsSubject.getValue()).to.beNull();

    rootEl.appendChild(addedEl);
    await retryUntil(() => recordsSubject.getValue()).toNot.beNull();

    // tslint:disable-next-line:no-non-null-assertion
    assert(recordsSubject.getValue()![0].addedNodes.item(0)).to.equal(addedEl);
  });
});
