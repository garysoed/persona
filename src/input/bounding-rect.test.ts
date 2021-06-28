import {assert, createSpySubject, objectThat, runEnvironment, setup, should, test} from 'gs-testing';

import {$div} from '../html/div';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';
import {dispatchResizeEvent} from '../testing/fake-resize-observer';
import {PersonaTesterEnvironment} from '../testing/persona-tester-environment';

import {boundingRect} from './bounding-rect';


test('@persona/src/input/bounding-rect', init => {
  setup(() => {
    runEnvironment(new PersonaTesterEnvironment());
  });

  const _ = init(() => {
    const $ = element('id', $div, {
      attr: boundingRect(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('div');
    el.id = 'id';
    el.style.position = 'fixed';
    el.style.height = '0';
    shadowRoot.appendChild(el);
    document.body.appendChild(root);

    const input = $._.attr;

    return {el, input, context: createFakeContext({shadowRoot})};
  });

  should('emit the bounding rects', () => {
    _.el.style.height = '10px';
    const rect$ = createSpySubject(_.input.getValue(_.context));

    _.el.style.height = '20px';
    dispatchResizeEvent(_.el, []);

    assert(rect$).to.emitSequence([
      objectThat<DOMRect>().haveProperties({height: 10}),
      objectThat<DOMRect>().haveProperties({height: 20}),
    ]);
  });
});