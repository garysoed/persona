import {arrayThat, assert, createSpySubject, run, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {combineLatest, fromEvent, of as observableOf, ReplaySubject} from 'rxjs';
import {map, shareReplay, take, tap} from 'rxjs/operators';

import {createFakeContext} from '../testing/create-fake-context';

import {renderElement} from './render-element';
import {RenderSpecType} from './types/render-spec-type';


test('@persona/render/render-element', init => {
  const TAG = 'pr-test';

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context};
  });

  should('emit the element', () => {
    const a = 'avalue';
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          attrs: new Map([['a', a]]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute('a'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(a$).to.emitSequence([a]);
  });

  should('update the attributes without emitting the element', () => {
    const b1 = 'b1';
    const b2 = 'b2';
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          attrs: new Map([['b', observableOf(b1, b2)]]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const b$ = createSpySubject(element$.pipe(map(el => el.getAttribute('b'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(b$).to.emitSequence([b2]);
  });

  should('delete the attribute if the value is undefined', () => {
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          attrs: new Map([['b', observableOf('bValue', undefined)]]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const b$ = createSpySubject(element$.pipe(map(el => el.hasAttribute('b'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(b$).to.emitSequence([false]);
  });

  should('update the text context without emitting the element', () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          textContent: observableOf(text1, text2),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const text$ = createSpySubject(element$.pipe(map(el => el.textContent)));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(text$).to.emitSequence([text2]);
  });

  should('delete the children without emitting the element', () => {
    const child1 = {
      type: RenderSpecType.ELEMENT as const,
      tag: 'div',
      id: {},
    };
    const child2 = {
      type: RenderSpecType.ELEMENT as const,
      tag: 'input',
      id: {},
    };
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          children: observableOf([child1, child2], [child1]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const children$ = createSpySubject(
        element$.pipe(map(el => arrayFrom(el.children)))
            .pipe(map(els => els.map(el => el.tagName))),
    );

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(children$).to.emitSequence([arrayThat<string>().haveExactElements(['DIV'])]);
  });

  should('insert the children without emitting the element', () => {
    const child1 = {
      type: RenderSpecType.ELEMENT as const,
      tag: 'div',
      id: {},
    };
    const child2 = {
      type: RenderSpecType.ELEMENT as const,
      tag: 'input',
      id: {},
    };
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          children: observableOf([child2], [child1, child2]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const children$ = createSpySubject(
        element$.pipe(map(el => arrayFrom(el.children)))
            .pipe(map(els => els.map(el => el.tagName))),
    );

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(children$).to.emitSequence([arrayThat<string>().haveExactElements(['DIV', 'INPUT'])]);
  });

  should('set the children without emitting the element', () => {
    const child1 = {
      type: RenderSpecType.ELEMENT as const,
      tag: 'div',
      id: {},
    };
    const child2 = {
      type: RenderSpecType.ELEMENT as const,
      tag: 'input',
      id: {},
    };
    const element$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          children: observableOf([child2], [child1]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const children$ = createSpySubject(
        element$.pipe(map(el => arrayFrom(el.children)))
            .pipe(map(els => els.map(el => el.tagName))),
    );

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(children$).to.emitSequence([arrayThat<string>().haveExactElements(['DIV'])]);
  });

  should('run the decorator correctly', () => {
    const onEvent$ = new ReplaySubject<EventTarget>();

    const el$ = renderElement(
        {
          type: RenderSpecType.ELEMENT,
          tag: TAG,
          id: 'id',
          decorator: el => fromEvent(el, 'click').pipe(tap(e => onEvent$.next(e.target!))),
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: false}));

    // Click should be registered.
    run(el$.pipe(take(1), tap(el => el.click())));
    assert(combineLatest([onEvent$, el$]).pipe(map(([target, el]) => target === el)))
        .to.emitSequence([true]);
  });
});
