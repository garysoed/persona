import { assert, createSpySubject, runEnvironment, should, test } from 'gs-testing';

import { PersonaTesterEnvironment } from '../testing/persona-tester-environment';

import { elementObservable } from './element-observable';


test('@persona/util/elementObservable', init => {
  init(() => {
    runEnvironment(new PersonaTesterEnvironment());
    return {};
  });

  should(`emit the elements correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    const addedEl = document.createElement('div');

    const element$ = createSpySubject<null|HTMLDivElement>(
        elementObservable(rootEl, rootEl => rootEl.querySelector('div')!),
    );

    rootEl.appendChild(addedEl);
    assert(element$).to.emitSequence([null, addedEl]);

    rootEl.removeChild(addedEl);
    assert(element$).to.emitSequence([null, addedEl, null]);
  });
});
