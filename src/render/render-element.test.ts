import { arrayFrom } from 'gs-tools/export/collect';
import { arrayThat, assert, createSpySubject, should, test } from 'gs-testing';
import { map, shareReplay } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';

import { createFakeContext } from '../testing/create-fake-context';

import { renderElement } from './render-element';


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
    const values = {
      attrs: new Map([['a', observableOf(a)]]),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute('a'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(a$).to.emitSequence([a]);
  });

  should('update the attributes without emitting the element', () => {
    const b1 = 'b1';
    const b2 = 'b2';
    const values = {
      attrs: new Map([['b', observableOf(b1, b2)]]),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const b$ = createSpySubject(element$.pipe(map(el => el.getAttribute('b'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(b$).to.emitSequence([b2]);
  });

  should('delete the attribute if the value is null', () => {
    const values = {
      attrs: new Map([['b', observableOf('bValue', null)]]),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const b$ = createSpySubject(element$.pipe(map(el => el.hasAttribute('b'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(b$).to.emitSequence([false]);
  });

  should('update the text context without emitting the element', () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const values = {
      textContent: observableOf(text1, text2),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const text$ = createSpySubject(element$.pipe(map(el => el.textContent)));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(text$).to.emitSequence([text2]);
  });

  should('delete the children without emitting the element', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    const values = {
      children: observableOf([child1, child2], [child1]),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const children$ = createSpySubject(element$.pipe(map(el => arrayFrom(el.children))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(children$).to.emitSequence([arrayThat<Element>().haveExactElements([child1])]);
  });

  should('insert the children without emitting the element', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    const values = {
      children: observableOf([child2], [child1, child2]),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const children$ = createSpySubject(element$.pipe(map(el => arrayFrom(el.children))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(children$).to.emitSequence([arrayThat<Element>().haveExactElements([child1, child2])]);
  });

  should('set the children without emitting the element', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    const values = {
      children: observableOf([child2], [child1]),
    };
    const element$ = renderElement(TAG, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const children$ = createSpySubject(element$.pipe(map(el => arrayFrom(el.children))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(children$).to.emitSequence([arrayThat<Element>().haveExactElements([child1])]);
  });
});
