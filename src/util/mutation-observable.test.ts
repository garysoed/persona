import { assert, should, test } from 'gs-testing';
import { ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { mutationObservable } from './mutation-observable';


test('@persona/util/mutation-observable', () => {
  should(`emit the records correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    document.appendChild(rootEl);
    const addedEl = document.createElement('div');

    const records$ = new ReplaySubject<Node|null>(1);
    mutationObservable(rootEl, {childList: true})
        .pipe(
            filter(records => records.length > 0),
            map(records => records[0].addedNodes.item(0)),
        )
        .subscribe(records$);

    assert(records$).toNot.emit();

    rootEl.appendChild(addedEl);

    assert(records$).to.emitWith(addedEl);
  });
});
