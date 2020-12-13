import {assert, should, test} from 'gs-testing';
import {fromEvent, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {applyDecorators} from './apply-decorators';
import {setId} from './set-id';


test('@persona/render/apply-decorators', () => {
  should('attach the ID and decorator correctly', () => {
    const onEvent1$ = new ReplaySubject<EventTarget>();
    const onEvent2$ = new ReplaySubject<string>();

    const el = setId(document.createElement('div'), 'id');
    const el$ = new ReplaySubject<unknown>();
    const subscription = applyDecorators(
        el,
        el => fromEvent(el, 'click').pipe(tap(e => onEvent1$.next(e.target!))),
        el => fromEvent(el, 'click')
            .pipe(tap(e => onEvent2$.next((e.target! as HTMLElement).tagName))),
    )
        .subscribe(el$);

    assert(el$).to.emitWith(el);

    // Click should be registered.
    el.click();
    assert(onEvent1$).to.emitSequence([el]);
    assert(onEvent2$).to.emitSequence(['DIV']);

    // Unsubscribe, click should not be registered.
    subscription.unsubscribe();
    el.click();
    assert(onEvent1$).to.emitSequence([el]);
    assert(onEvent2$).to.emitSequence(['DIV']);
  });
});