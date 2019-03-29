import { assert, should, test } from '@gs-testing/main';
import { createSpySubject } from '@gs-testing/spy';
import { InstanceofType } from 'gs-types/export';
import { element } from './element';
import { MatchOptions, onKeydown, OnKeydownInput } from './on-keydown';

test('input.onKeydown', () => {
  const KEY = 'key';
  const ELEMENT_ID = 'test';
  let shadowRoot: ShadowRoot;
  let el: HTMLInputElement;

  function createInput(options: MatchOptions): OnKeydownInput {
    const $ = element(ELEMENT_ID, InstanceofType(HTMLInputElement), {
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
      assert(spySubject.getValue()).to.equal(event);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject.hasValue()).to.beFalse();
    });

    should(`match the alt correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // alt === true
      matchOptions.alt = true;
      spySubject.reset();
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      el.dispatchEvent(altEvent);
      assert(spySubject.getValue()).to.equal(altEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject.hasValue()).to.beFalse();

      // alt === false
      matchOptions.alt = false;
      spySubject.reset();
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonAltEvent);
      assert(spySubject.getValue()).to.equal(nonAltEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(spySubject.hasValue()).to.beFalse();

      // alt === null
      matchOptions.alt = undefined;
      spySubject.reset();
      el.dispatchEvent(altEvent);
      assert(spySubject.getValue()).to.equal(altEvent);

      spySubject.reset();
      el.dispatchEvent(nonAltEvent);
      assert(spySubject.getValue()).to.equal(nonAltEvent);
    });

    should(`match the ctrl correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // ctrl === true
      matchOptions.ctrl = true;
      spySubject.reset();
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      el.dispatchEvent(ctrlEvent);
      assert(spySubject.getValue()).to.equal(ctrlEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject.hasValue()).to.beFalse();

      // ctrl === false
      matchOptions.ctrl = false;
      spySubject.reset();
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonCtrlEvent);
      assert(spySubject.getValue()).to.equal(nonCtrlEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(spySubject.hasValue()).to.beFalse();

      // ctrl === null
      matchOptions.ctrl = undefined;
      spySubject.reset();
      el.dispatchEvent(ctrlEvent);
      assert(spySubject.getValue()).to.equal(ctrlEvent);

      spySubject.reset();
      el.dispatchEvent(nonCtrlEvent);
      assert(spySubject.getValue()).to.equal(nonCtrlEvent);
    });

    should(`match the meta correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // meta === true
      matchOptions.meta = true;
      spySubject.reset();
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      el.dispatchEvent(metaEvent);
      assert(spySubject.getValue()).to.equal(metaEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject.hasValue()).to.beFalse();

      // meta === false
      matchOptions.meta = false;
      spySubject.reset();
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonMetaEvent);
      assert(spySubject.getValue()).to.equal(nonMetaEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(spySubject.hasValue()).to.beFalse();

      // meta === null
      matchOptions.meta = undefined;
      spySubject.reset();
      el.dispatchEvent(metaEvent);
      assert(spySubject.getValue()).to.equal(metaEvent);

      spySubject.reset();
      el.dispatchEvent(nonMetaEvent);
      assert(spySubject.getValue()).to.equal(nonMetaEvent);
    });

    should(`match the shift correctly`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      // shift === true
      matchOptions.shift = true;
      spySubject.reset();
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      el.dispatchEvent(shiftEvent);
      assert(spySubject.getValue()).to.equal(shiftEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject.hasValue()).to.beFalse();

      // shift === false
      matchOptions.shift = false;
      spySubject.reset();
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(nonShiftEvent);
      assert(spySubject.getValue()).to.equal(nonShiftEvent);

      spySubject.reset();
      el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(spySubject.hasValue()).to.beFalse();

      // shift === null
      matchOptions.shift = undefined;
      spySubject.reset();
      el.dispatchEvent(shiftEvent);
      assert(spySubject.getValue()).to.equal(shiftEvent);

      spySubject.reset();
      el.dispatchEvent(nonShiftEvent);
      assert(spySubject.getValue()).to.equal(nonShiftEvent);
    });

    should(`ignore if event is not KeyboardEvent`, () => {
      const matchOptions: MatchOptions = {};
      const spySubject = createSpySubject(createInput(matchOptions).getValue(shadowRoot));

      const event = new KeyboardEvent('keydown', {key: KEY});
      el.dispatchEvent(event);
      assert(spySubject.getValue()).to.equal(event);

      spySubject.reset();
      el.dispatchEvent(new CustomEvent<{}>('keydown'));
      assert(spySubject.hasValue()).to.beFalse();
    });
  });
});
