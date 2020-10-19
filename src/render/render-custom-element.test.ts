import { assert, createSpySubject, run, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { attribute } from '../input/attribute';
import { createFakeContext } from '../testing/create-fake-context';
import { integerParser, stringParser } from '../util/parsers';

import { __id } from './node-with-id';
import { renderCustomElement } from './render-custom-element';

const $spec = {
  tag: 'pr-test',
  api: {
    a: attribute('a', stringParser()),
    b: attribute('b', integerParser()),
  },
};

test('@persona/render/render-custom-element', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context};
  });

  should(`emit the custom element`, () => {
    const id = 'id';
    const a = 'avalue';
    const values = {
      inputs: {a: observableOf(a)},
    };
    const element$ = renderCustomElement($spec, values, id, _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute($spec.api.a.attrName))));
    const id$ = createSpySubject(element$.pipe(map(el => el[__id])));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(a$).to.emitSequence([a]);
    assert(id$).to.emitSequence([id]);
  });

  should(`update the inputs without emitting the custom element`, () => {
    const a1 = 'a1';
    const a2 = 'a2';
    const values = {
      inputs: {a: observableOf(a1, a2)},
    };
    const element$ = renderCustomElement($spec, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute($spec.api.a.attrName))));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(a$).to.emitSequence([a2]);
  });

  should(`update the extra attributes without emitting the custom element`, () => {
    const b1 = 'b1';
    const b2 = 'b2';
    const values = {
      attrs: new Map([['b', observableOf(b1, b2)]]),
    };
    const element$ = renderCustomElement($spec, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const b$ = createSpySubject(element$.pipe(map(el => el.getAttribute('b'))));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(b$).to.emitSequence([b2]);
  });

  should(`update the text context without emitting the custom element`, () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const values = {
      textContent: observableOf(text1, text2),
    };
    const element$ = renderCustomElement($spec, values, 'id', _.context)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const text$ = createSpySubject(element$.pipe(map(el => el.textContent)));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(text$).to.emitSequence([text2]);
  });
});
