import {assert, createSpySubject, should, test} from 'gs-testing';
import {of as observableOf} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {integerParser, stringParser} from '../../src-next/util/parsers';
import {attribute} from '../input/attribute';
import {createFakeContext} from '../testing/create-fake-context';


import {__id} from './node-with-id';
import {renderCustomElement} from './render-custom-element';
import {RenderSpecType} from './types/render-spec-type';


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

  should('emit the custom element', () => {
    const id = 'id';
    const a = 'avalue';
    const element$ = renderCustomElement(
        {
          type: RenderSpecType.CUSTOM_ELEMENT,
          spec: $spec,
          inputs: {
            a: observableOf(a),
            b: observableOf(123),
          },
          id,
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute($spec.api.a.attrName))));
    const b$ = createSpySubject(element$.pipe(map(el => el.getAttribute($spec.api.b.attrName))));
    const id$ = createSpySubject(element$.pipe(map(el => el[__id])));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(a$).to.emitSequence([a]);
    assert(b$).to.emitSequence(['123']);
    assert(id$).to.emitSequence([id]);
  });

  should('update the inputs without emitting the custom element', () => {
    const a1 = 'a1';
    const a2 = 'a2';
    const element$ = renderCustomElement(
        {
          type: RenderSpecType.CUSTOM_ELEMENT,
          spec: $spec,
          inputs: {
            a: observableOf(a1, a2),
            b: observableOf(123, 456),
          },
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const a$ = createSpySubject(element$.pipe(map(el => el.getAttribute($spec.api.a.attrName))));
    const b$ = createSpySubject(element$.pipe(map(el => el.getAttribute($spec.api.b.attrName))));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(a$).to.emitSequence([a2]);
    assert(b$).to.emitSequence(['456']);
  });

  should('update the extra attributes without emitting the custom element', () => {
    const c1 = 'c1';
    const c2 = 'c2';
    const element$ = renderCustomElement(
        {
          type: RenderSpecType.CUSTOM_ELEMENT,
          spec: $spec,
          inputs: {
            a: observableOf('a'),
            b: observableOf(123),
          },
          attrs: new Map([['c', observableOf(c1, c2)]]),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const c$ = createSpySubject(element$.pipe(map(el => el.getAttribute('c'))));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(c$).to.emitSequence([c2]);
  });

  should('update the text context without emitting the custom element', () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const element$ = renderCustomElement(
        {
          type: RenderSpecType.CUSTOM_ELEMENT,
          spec: $spec,
          inputs: {
            a: observableOf('a'),
            b: observableOf(123),
          },
          textContent: observableOf(text1, text2),
          id: 'id',
        },
        _.context,
    )
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const tag$ = createSpySubject(element$.pipe(map(el => el.tagName)));
    const text$ = createSpySubject(element$.pipe(map(el => el.textContent)));

    assert(tag$).to.emitSequence([$spec.tag.toUpperCase()]);
    assert(text$).to.emitSequence([text2]);
  });
});
