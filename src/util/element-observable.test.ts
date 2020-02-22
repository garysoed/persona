import { assert, should, test } from 'gs-testing';
import { ReplaySubject } from 'rxjs';

import { elementObservable } from './element-observable';


test('@persona/util/elementObservable', () => {
  should(`emit the elements correctly`, async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    const addedEl = document.createElement('div');

    const element$ = new ReplaySubject<HTMLElement|null>(3);
    // tslint:disable-next-line:no-non-null-assertion
    elementObservable(rootEl, rootEl => rootEl.querySelector('div')!).subscribe(element$);

    rootEl.appendChild(addedEl);
    assert(element$).to.emitSequence([null, addedEl]);

    rootEl.removeChild(addedEl);
    assert(element$).to.emitSequence([null, addedEl, null]);
  });
});
