import { assert, retryUntil, should } from 'gs-testing/export/main';
import { BehaviorSubject } from 'rxjs';
import { mutationObservable } from './mutation-observable';

describe('util.mutationObservable', () => {
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
