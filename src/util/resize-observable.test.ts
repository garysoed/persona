import { assert, createSpySubject, runEnvironment, should, test } from 'gs-testing';

import { resizeObservable } from '../../export';
import { dispatchResizeEvent } from '../testing/fake-resize-observer';
import { PersonaTesterEnvironment } from '../testing/persona-tester-environment';


test('@persona/util/resize-observable', init => {
  init(() => {
    runEnvironment(new PersonaTesterEnvironment());
    return {};
  });

  should(`emit correctly`, () => {
    const addedEl = document.createElement('div');
    addedEl.style.position = 'fixed';
    addedEl.style.height = '0';
    document.body.appendChild(addedEl);

    const records$ = createSpySubject(resizeObservable(addedEl, {}));
    assert(records$).toNot.emit();

    addedEl.style.height = '23px';
    dispatchResizeEvent(addedEl);

    assert(records$).to.emit();
  });
});
