import {assert, should, test} from 'gs-testing';
import {fromEvent, ReplaySubject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {__id} from './node-with-id';
import {renderBase} from './render-base';
import {BaseRenderSpec} from './types/base-render-spec';


test('@persona/render/render-base', () => {
  should('attach the ID and decorator correctly', () => {
    const id = 'id';
    const onEvent$ = new ReplaySubject<EventTarget>();
    const spec: BaseRenderSpec<Element> = {
      id,
      decorators: [el => fromEvent(el, 'click').pipe(
          tap(e => onEvent$.next(e.target!)),
      )],
    };

    const el = document.createElement('div');
    const id$ = new ReplaySubject<unknown>();
    const subscription = renderBase(spec, el).pipe(map(el => el[__id])).subscribe(id$);

    assert(id$).to.emitWith(id);

    // Click should be registered.
    el.click();
    assert(onEvent$).to.emitSequence([el]);

    // Unsubscribe, click should not be registered.
    subscription.unsubscribe();
    el.click();
    assert(onEvent$).to.emitSequence([el]);
  });
});