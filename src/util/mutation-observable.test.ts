import { assert, createSpySubject, runEnvironment, should, test } from 'gs-testing';
import { filter, map } from 'rxjs/operators';

import { PersonaTesterEnvironment } from '../testing/persona-tester-environment';

import { mutationObservable } from './mutation-observable';


test('@persona/util/mutation-observable', init => {
  init(() => {
    runEnvironment(new PersonaTesterEnvironment());
    return {};
  });

  should(`emit the records correctly`, () => {
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
