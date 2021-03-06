import {assert, createSpySubject, should, teardown, test} from 'gs-testing';

import {installFakeMutationObserver} from '../../export/testing';
import {$input} from '../html/input';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {textIn} from './text-in';


test('@persona/input/text-input', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    const uninstallFakeMutationObserver = installFakeMutationObserver();
    const $ = element(ELEMENT_ID, $input, {
      textIn: textIn(),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('input');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    const input = $._.textIn;

    return {input, context: createFakeContext({shadowRoot}), el, uninstallFakeMutationObserver};
  });

  teardown(() => {
    _.uninstallFakeMutationObserver();
  });

  test('getValue', () => {
    should('create observable that emits the values', () => {

      const initValue = 'initValue';
      _.el.textContent = initValue;

      const value$ = createSpySubject(_.input.getValue(_.context));

      const value = 'value';
      const event = new CustomEvent('pr-fake-mutation', {bubbles: true, detail: {record: []}});
      _.el.textContent = value;
      _.el.dispatchEvent(event);

      _.el.value = initValue;

      assert(value$).to.emitSequence([initValue, value]);
    });
  });
});
