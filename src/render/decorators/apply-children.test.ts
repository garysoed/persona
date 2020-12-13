import {arrayThat, assert, createSpySubject, should, test} from 'gs-testing';
import {arrayFrom} from 'gs-tools/export/collect';
import {of as observableOf} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';

import {createFakeContext} from '../../testing/create-fake-context';
import {setId} from '../set-id';
import {RenderSpecType} from '../types/render-spec-type';

import {applyChildren} from './apply-children';


test('@persona/render/decorators/apply-children', init => {
  const _ = init(() => {
    const el = setId(document.createElement('div'), 'id');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    return {context, el};
  });

  should('delete the children correctly', () => {
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
    const onUpdate$ = applyChildren(observableOf([child1, child2], [child1]), _.context)(_.el)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const children$ = createSpySubject(onUpdate$.pipe(map(() => arrayFrom(_.el.children)))
        .pipe(map(els => els.map(el => el.tagName))),
    );

    assert(children$).to.emitSequence([arrayThat<string>().haveExactElements(['DIV'])]);
  });

  should('insert the children correctly', () => {
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
    const onUpdate$ = applyChildren(observableOf([child2], [child1, child2]), _.context)(_.el)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const children$ = createSpySubject(onUpdate$.pipe(map(() => arrayFrom(_.el.children)))
        .pipe(map(els => els.map(el => el.tagName))),
    );

    assert(children$).to.emitSequence([arrayThat<string>().haveExactElements(['DIV', 'INPUT'])]);
  });

  should('set the children correctly', () => {
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
    const onUpdate$ = applyChildren(observableOf([child2], [child1]), _.context)(_.el)
        .pipe(shareReplay({bufferSize: 1, refCount: true}));

    const children$ = createSpySubject(onUpdate$.pipe(map(() => arrayFrom(_.el.children)))
        .pipe(map(els => els.map(el => el.tagName))),
    );

    assert(children$).to.emitSequence([arrayThat<string>().haveExactElements(['DIV'])]);
  });
});
