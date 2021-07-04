import {assert, createSpySubject, should, test} from 'gs-testing';
import {BehaviorSubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {$input} from '../html/input';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';

import {MatchOptions, onKeydown, OnKeydownInput} from './on-keydown';


test('input.onKeydown', init => {
  const KEY = 'key';
  const ELEMENT_ID = 'test';

  function createInput(options: MatchOptions): OnKeydownInput {
    const $ = element(ELEMENT_ID, $input, {
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
      const matchOptions$ = new BehaviorSubject<MatchOptions>({});
      const spySubject = createSpySubject(
          matchOptions$.pipe(
              switchMap(matchOptions => createInput(matchOptions).getValue(_.context),
              ),
          ));

      // alt === true
      matchOptions$.next({...matchOptions$.getValue(), alt: true});
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      _.el.dispatchEvent(altEvent);
      assert(spySubject).to.emitWith(altEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([altEvent]);

      // alt === false
      matchOptions$.next({...matchOptions$.getValue(), alt: false});
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonAltEvent);
      assert(spySubject).to.emitWith(nonAltEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert(spySubject).to.emitSequence([altEvent, nonAltEvent]);

      // alt === undefined
      matchOptions$.next({...matchOptions$.getValue(), alt: undefined});
      _.el.dispatchEvent(altEvent);
      assert(spySubject).to.emitWith(altEvent);

      _.el.dispatchEvent(nonAltEvent);
      assert(spySubject).to.emitWith(nonAltEvent);
    });

    should('match the ctrl correctly', () => {
      const matchOptions$ = new BehaviorSubject<MatchOptions>({});
      const spySubject = createSpySubject(
          matchOptions$.pipe(
              switchMap(matchOptions => createInput(matchOptions).getValue(_.context),
              ),
          ));

      // ctrl === true
      matchOptions$.next({...matchOptions$.getValue(), ctrl: true});
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      _.el.dispatchEvent(ctrlEvent);
      assert(spySubject).to.emitWith(ctrlEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([ctrlEvent]);

      // ctrl === false
      matchOptions$.next({...matchOptions$.getValue(), ctrl: false});
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonCtrlEvent);
      assert(spySubject).to.emitWith(nonCtrlEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert(spySubject).to.emitSequence([ctrlEvent, nonCtrlEvent]);

      // ctrl === undefined
      matchOptions$.next({...matchOptions$.getValue(), ctrl: undefined});
      _.el.dispatchEvent(ctrlEvent);
      assert(spySubject).to.emitWith(ctrlEvent);

      _.el.dispatchEvent(nonCtrlEvent);
      assert(spySubject).to.emitWith(nonCtrlEvent);
    });

    should('match the meta correctly', () => {
      const matchOptions$ = new BehaviorSubject<MatchOptions>({});
      const spySubject = createSpySubject(
          matchOptions$.pipe(
              switchMap(matchOptions => createInput(matchOptions).getValue(_.context),
              ),
          ));

      // meta === true
      matchOptions$.next({...matchOptions$.getValue(), meta: true});
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      _.el.dispatchEvent(metaEvent);
      assert(spySubject).to.emitWith(metaEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([metaEvent]);

      // meta === false
      matchOptions$.next({...matchOptions$.getValue(), meta: false});
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonMetaEvent);
      assert(spySubject).to.emitWith(nonMetaEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert(spySubject).to.emitSequence([metaEvent, nonMetaEvent]);

      // meta === undefined
      matchOptions$.next({...matchOptions$.getValue(), meta: undefined});
      _.el.dispatchEvent(metaEvent);
      assert(spySubject).to.emitWith(metaEvent);

      _.el.dispatchEvent(nonMetaEvent);
      assert(spySubject).to.emitWith(nonMetaEvent);
    });

    should('match the shift correctly', () => {
      const matchOptions$ = new BehaviorSubject<MatchOptions>({});
      const spySubject = createSpySubject(
          matchOptions$.pipe(
              switchMap(matchOptions => createInput(matchOptions).getValue(_.context),
              ),
          ));

      // shift === true
      matchOptions$.next({...matchOptions$.getValue(), shift: true});
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      _.el.dispatchEvent(shiftEvent);
      assert(spySubject).to.emitWith(shiftEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert(spySubject).to.emitSequence([shiftEvent]);

      // shift === false
      matchOptions$.next({...matchOptions$.getValue(), shift: false});
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      _.el.dispatchEvent(nonShiftEvent);
      assert(spySubject).to.emitWith(nonShiftEvent);

      _.el.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert(spySubject).to.emitSequence([shiftEvent, nonShiftEvent]);

      // shift === undefined
      matchOptions$.next({...matchOptions$.getValue(), shift: undefined});
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
