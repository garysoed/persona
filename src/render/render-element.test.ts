import { assert, createSpySubject, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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

  should(`emit the element`, () => {
    const a = 'avalue';
    const values = {
      attrs: new Map([['a', observableOf(a)]]),
    };
    const element$ = renderElement(TAG, values, _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute('a'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(a$).to.emitSequence([a]);
  });

  should(`update the attributes without emitting the element`, () => {
    const b1 = 'b1';
    const b2 = 'b2';
    const values = {
      attrs: new Map([['b', observableOf(b1, b2)]]),
    };
    const element$ = renderElement(TAG, values, _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const b$ = createSpySubject(element$.pipe(map(el => el.getAttribute('b'))));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(b$).to.emitSequence([b2]);
  });

  should(`update the text context without emitting the element`, () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const values = {
      textContent: observableOf(text1, text2),
    };
    const element$ = renderElement(TAG, values, _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const text$ = createSpySubject(element$.pipe(map(el => el.textContent)));

    assert(tag$).to.emitSequence([TAG.toUpperCase()]);
    assert(text$).to.emitSequence([text2]);
  });
});
