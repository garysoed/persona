import { assert, match, should, test } from '@gs-testing';
import { ReplaySubject } from '@rxjs';
import { take } from '@rxjs/operators';
import { mutationObservable } from './mutation-observable';

test('util.mutationObservable', () => {
  should(`emit the records correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    document.appendChild(rootEl);
    const addedEl = document.createElement('div');

    const recordsSubject = new ReplaySubject<MutationRecord[]>(1);
    mutationObservable(rootEl, {childList: true})
        // TODO: Uncomment. This is because FakeMutationObserver is running.
        // .pipe(filter(records => records.length > 0))
        .subscribe(recordsSubject);

    assert(recordsSubject).toNot.emit();

    rootEl.appendChild(addedEl);

    // Wait for an emission.
    await recordsSubject.pipe(take(1)).toPromise();

    assert(recordsSubject).to.emitWith(match.anyThat<MutationRecord[]>().beAnInstanceOf(Array));

    // TODO: uncomment.
    // recordsSubject
    //     .pipe(
    //         take(1),
    //         map(records => records[0].addedNodes.item(0)),
    //     )
    //     .subscribe(el => assert(el).to.equal(addedEl), fail);
  });
});
