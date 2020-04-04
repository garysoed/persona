import { assert, createSpySubject, should, test } from 'gs-testing';
import { instanceofType } from 'gs-types';

import { element } from '../main/element';

import { MatchOptions, onKeydown, OnKeydownInput } from './on-keydown';

test('input.onKeydown', () => {
  const KEY = 'key';
  const ELEMENT_ID = 'test';
  let shadowRoot: ShadowRoot;
  let el: HTMLInputElement;

  function createInput(options: MatchOptions): OnKeydownInput {
    const $ = element(ELEMENT_ID, instanceofType(HTMLInputElement), {
      onKeydown: onKeydown(KEY, options),
    });

    return $._.onKeydown as OnKeydownInput;
  }

  beforeEach(() => {
    const root = document.createElement('div');
    shadowRoot = root.attachShadow({mode: 'open'});

    el = document.createElement('input');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);
  });

  test('getValue', () => {
    should(`match the key correctly`, () => {
      const spySubject = createSpySubject(createInput({}).getValue(shadowRoot));

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(spySubject).to.emitWith(event);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([event]);
    });

    should(`match the alt correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // alt === true
      matchOptions.alt = true;
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      el.dispatchEvent(altEvent);
      assert(spySubject).to.emitWith(altEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([altEvent]);

      // alt === false
      matchOptions.alt = false;
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonAltEvent);
      assert(spySubject).to.emitWith(nonAltEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(spySubject).to.emitSequence([altEvent, nonAltEvent]);

      // alt === null
      matchOptions.alt = undefined;
      el.dispatchEvent(altEvent);
      assert(spySubject).to.emitWith(altEvent);

      el.dispatchEvent(nonAltEvent);
      assert(spySubject).to.emitWith(nonAltEvent);
    });

    should(`match the ctrl correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // ctrl === true
      matchOptions.ctrl = true;
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      el.dispatchEvent(ctrlEvent);
      assert(spySubject).to.emitWith(ctrlEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([ctrlEvent]);

      // ctrl === false
      matchOptions.ctrl = false;
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonCtrlEvent);
      assert(spySubject).to.emitWith(nonCtrlEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(spySubject).to.emitSequence([ctrlEvent, nonCtrlEvent]);

      // ctrl === null
      matchOptions.ctrl = undefined;
      el.dispatchEvent(ctrlEvent);
      assert(spySubject).to.emitWith(ctrlEvent);

      el.dispatchEvent(nonCtrlEvent);
      assert(spySubject).to.emitWith(nonCtrlEvent);
    });

    should(`match the meta correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // meta === true
      matchOptions.meta = true;
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      el.dispatchEvent(metaEvent);
      assert(spySubject).to.emitWith(metaEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([metaEvent]);

      // meta === false
      matchOptions.meta = false;
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonMetaEvent);
      assert(spySubject).to.emitWith(nonMetaEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(spySubject).to.emitSequence([metaEvent, nonMetaEvent]);

      // meta === null
      matchOptions.meta = undefined;
      el.dispatchEvent(metaEvent);
      assert(spySubject).to.emitWith(metaEvent);

      el.dispatchEvent(nonMetaEvent);
      assert(spySubject).to.emitWith(nonMetaEvent);
    });

    should(`match the shift correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // shift === true
      matchOptions.shift = true;
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      el.dispatchEvent(shiftEvent);
      assert(spySubject).to.emitWith(shiftEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([shiftEvent]);

      // shift === false
      matchOptions.shift = false;
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonShiftEvent);
      assert(spySubject).to.emitWith(nonShiftEvent);

      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(spySubject).to.emitSequence([shiftEvent, nonShiftEvent]);

      // shift === null
      matchOptions.shift = undefined;
      el.dispatchEvent(shiftEvent);
      assert(spySubject).to.emitWith(shiftEvent);

      el.dispatchEvent(nonShiftEvent);
      assert(spySubject).to.emitWith(nonShiftEvent);
    });

    should(`ignore if event is not KeyboardEvent`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(spySubject).to.emitWith(event);

      el.dispatchEvent(new CustomEvent<{}>('keydown'));
      assert(spySubject).to.emitSequence([event]);
    });
  });
});
