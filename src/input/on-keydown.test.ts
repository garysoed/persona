import { assert, createSpySubject, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { createFakeContext } from '../testing/create-fake-context';
import { element } from '../selector/element';

import { MatchOptions, OnKeydownInput, onKeydown } from './on-keydown';

test('input.onKeydown', init => {
  const KEY = 'key';
  const ELEMENT_ID = 'test';

  function createInput(options: MatchOptions): OnKeydownInput {
    const $ = element(ELEMENT_ID, instanceofType(HTMLInputElement), {
      onKeydown: onKeydown(KEY, options),
    });

    return $._.onKeydown as OnKeydownInput;
  }

  const _ = init(() => {
    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('input');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    return {context: createFakeContext({shadowRoot}), el};
  });

  test('getValue', () => {
    should('match the key correctly', () => {
      const spySubject = createSpySubject(createInput({}).getValue(_.context));

      const event = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(event);
      assert(spySubject).to.emitWith(event);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([event]);
    });

    should('match the alt correctly', () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(_.context));

      // alt === true
      matchOptions.alt = true;
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      _.el.dispatchEvent(altEvent);
      assert(spySubject).to.emitWith(altEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([altEvent]);

      // alt === false
      matchOptions.alt = false;
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonAltEvent);
      assert(spySubject).to.emitWith(nonAltEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(spySubject).to.emitSequence([altEvent, nonAltEvent]);

      // alt === null
      matchOptions.alt = undefined;
      _.el.dispatchEvent(altEvent);
      assert(spySubject).to.emitWith(altEvent);

      _.el.dispatchEvent(nonAltEvent);
      assert(spySubject).to.emitWith(nonAltEvent);
    });

    should('match the ctrl correctly', () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(_.context));

      // ctrl === true
      matchOptions.ctrl = true;
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      _.el.dispatchEvent(ctrlEvent);
      assert(spySubject).to.emitWith(ctrlEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([ctrlEvent]);

      // ctrl === false
      matchOptions.ctrl = false;
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonCtrlEvent);
      assert(spySubject).to.emitWith(nonCtrlEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(spySubject).to.emitSequence([ctrlEvent, nonCtrlEvent]);

      // ctrl === null
      matchOptions.ctrl = undefined;
      _.el.dispatchEvent(ctrlEvent);
      assert(spySubject).to.emitWith(ctrlEvent);

      _.el.dispatchEvent(nonCtrlEvent);
      assert(spySubject).to.emitWith(nonCtrlEvent);
    });

    should('match the meta correctly', () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(_.context));

      // meta === true
      matchOptions.meta = true;
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      _.el.dispatchEvent(metaEvent);
      assert(spySubject).to.emitWith(metaEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([metaEvent]);

      // meta === false
      matchOptions.meta = false;
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonMetaEvent);
      assert(spySubject).to.emitWith(nonMetaEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(spySubject).to.emitSequence([metaEvent, nonMetaEvent]);

      // meta === null
      matchOptions.meta = undefined;
      _.el.dispatchEvent(metaEvent);
      assert(spySubject).to.emitWith(metaEvent);

      _.el.dispatchEvent(nonMetaEvent);
      assert(spySubject).to.emitWith(nonMetaEvent);
    });

    should('match the shift correctly', () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(_.context));

      // shift === true
      matchOptions.shift = true;
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      _.el.dispatchEvent(shiftEvent);
      assert(spySubject).to.emitWith(shiftEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([shiftEvent]);

      // shift === false
      matchOptions.shift = false;
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonShiftEvent);
      assert(spySubject).to.emitWith(nonShiftEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(spySubject).to.emitSequence([shiftEvent, nonShiftEvent]);

      // shift === null
      matchOptions.shift = undefined;
      _.el.dispatchEvent(shiftEvent);
      assert(spySubject).to.emitWith(shiftEvent);

      _.el.dispatchEvent(nonShiftEvent);
      assert(spySubject).to.emitWith(nonShiftEvent);
    });

    should('ignore if event is not KeyboardEvent', () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(_.context));

      const event = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(event);
      assert(spySubject).to.emitWith(event);

      _.el.dispatchEvent(new CustomEvent<unknown>('keydown'));
      assert(spySubject).to.emitSequence([event]);
    });
  });
});
