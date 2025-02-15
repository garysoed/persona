import {
  asyncAssert,
  createSpySubject,
  runEnvironment,
  setup,
  should,
  test,
} from 'gs-testing';
import {filter, map} from 'rxjs/operators';

import {PersonaTesterEnvironment} from '../testing/persona-tester-environment';

import {mutationObservable} from './mutation-observable';

test('@persona/src/util/mutation-observable', () => {
  setup(() => {
    runEnvironment(new PersonaTesterEnvironment());
  });

  should('emit the records correctly', async () => {
    const rootEl = document.createElement('div').attachShadow({mode: 'open'});
    document.appendChild(rootEl);
    const addedEl = document.createElement('div');

    const records$ = createSpySubject(
      mutationObservable(rootEl, {childList: true}).pipe(
        filter((records) => records.length > 0),
        map((records) => records[0]!.addedNodes.item(0)),
      ),
    );

    await asyncAssert(records$).toNot.emit();

    rootEl.appendChild(addedEl);

    await asyncAssert(records$).to.emitWith(addedEl);
  });
});
