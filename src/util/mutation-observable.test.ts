import { assert, createSpySubject, should, test } from 'gs-testing';
import { filter, map } from 'rxjs/operators';

import { mutationObservable } from './mutation-observable';


test('@persona/util/mutation-observable', () => {
  should(`emit the records correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    document.appendChild(rootEl);
    const addedEl = document.createElement('div');

    const records$ = createSpySubject(
        mutationObservable(rootEl, {childList: true})
            .pipe(
                filter(records => records.length > 0),
                map(records => records[0].addedNodes.item(0)),
            ),
    );

    assert(records$).toNot.emit();

    rootEl.appendChild(addedEl);

    assert(records$).to.emitWith(addedEl);
  });
});
