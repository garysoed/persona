import {
  asyncAssert,
  createSpySubject,
  runEnvironment,
  setup,
  should,
  test,
} from 'gs-testing';

import {dispatchResizeEvent} from '../testing/fake-resize-observer';
import {PersonaTesterEnvironment} from '../testing/persona-tester-environment';

import {resizeObservable} from './resize-observable';

test('@persona/src/util/resize-observable', () => {
  setup(() => {
    runEnvironment(new PersonaTesterEnvironment());
  });

  should('emit correctly', async () => {
    const addedEl = document.createElement('div');
    addedEl.style.position = 'fixed';
    addedEl.style.height = '0';
    document.body.appendChild(addedEl);

    const records$ = createSpySubject<Pick<ResizeObserverEntry, 'contentRect'>>(
      resizeObservable(addedEl, {}),
    );
    await asyncAssert(records$).toNot.emit();

    addedEl.style.height = '23px';

    const record1 = {contentRect: new DOMRect(1, 2, 3, 4)};
    const record2 = {contentRect: new DOMRect(5, 6, 7, 8)};
    dispatchResizeEvent(addedEl, [record1, record2]);

    await asyncAssert(records$).to.emitSequence([record1, record2]);
  });
});
