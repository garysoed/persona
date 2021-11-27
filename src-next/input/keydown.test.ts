import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {getEl} from '../testing/get-el';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ikeydown} from './keydown';


const $altTrue$ = source(() => new ReplaySubject<Event>());
const $altFalse$ = source(() => new ReplaySubject<Event>());
const $ctrlTrue$ = source(() => new ReplaySubject<Event>());
const $ctrlFalse$ = source(() => new ReplaySubject<Event>());
const $metaTrue$ = source(() => new ReplaySubject<Event>());
const $metaFalse$ = source(() => new ReplaySubject<Event>());
const $shiftTrue$ = source(() => new ReplaySubject<Event>());
const $shiftFalse$ = source(() => new ReplaySubject<Event>());
const $noOption$ = source(() => new ReplaySubject<Event>());

const KEY = 'key';

const $host = {
  shadow: {
    el: id('el', DIV, {
      altTrue: ikeydown(KEY, {alt: true}),
      altFalse: ikeydown(KEY, {alt: false}),
      ctrlTrue: ikeydown(KEY, {ctrl: true}),
      ctrlFalse: ikeydown(KEY, {ctrl: false}),
      metaTrue: ikeydown(KEY, {meta: true}),
      metaFalse: ikeydown(KEY, {meta: false}),
      shiftTrue: ikeydown(KEY, {shift: true}),
      shiftFalse: ikeydown(KEY, {shift: false}),
      noOption: ikeydown(KEY),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.el.altTrue.pipe(
          tap(event => $altTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.altFalse.pipe(
          tap(event => $altFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.ctrlTrue.pipe(
          tap(event => $ctrlTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.ctrlFalse.pipe(
          tap(event => $ctrlFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.metaTrue.pipe(
          tap(event => $metaTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.metaFalse.pipe(
          tap(event => $metaFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.shiftTrue.pipe(
          tap(event => $shiftTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.shiftFalse.pipe(
          tap(event => $shiftFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.noOption.pipe(
          tap(event => $noOption$.get(this.context.vine).next(event)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="el"></div>',
});


test('@persona/src/input/keydown', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('match the key correctly', () => {
      const element = _.tester.createElement(HOST);
      const root = getEl(element, 'el')!;

      const event = new KeyboardEvent('keydown', {key: KEY});
      root.dispatchEvent(event);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));

      assert($noOption$.get(_.tester.vine)).to.emitSequence([event]);
    });

    should('match the alt correctly', () => {
      const element = _.tester.createElement(HOST);
      const root = getEl(element, 'el')!;

      // alt === true
      const altEvent = new KeyboardEvent('keydown', {key: KEY, altKey: true});
      root.dispatchEvent(altEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert($altTrue$.get(_.tester.vine)).to.emitSequence([altEvent]);

      // alt === false
      const nonAltEvent = new KeyboardEvent('keydown', {key: KEY});
      root.dispatchEvent(nonAltEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', altKey: true}));
      assert($altFalse$.get(_.tester.vine)).to.emitSequence([nonAltEvent]);

      // alt === undefined
      assert($noOption$.get(_.tester.vine)).to.emitSequence([altEvent, nonAltEvent]);
    });

    should('match the ctrl correctly', () => {
      const element = _.tester.createElement(HOST);
      const root = getEl(element, 'el')!;

      // ctrl === true
      const ctrlEvent = new KeyboardEvent('keydown', {key: KEY, ctrlKey: true});
      root.dispatchEvent(ctrlEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert($ctrlTrue$.get(_.tester.vine)).to.emitSequence([ctrlEvent]);

      // ctrl === false
      const nonCtrlEvent = new KeyboardEvent('keydown', {key: KEY});
      root.dispatchEvent(nonCtrlEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', ctrlKey: true}));
      assert($ctrlFalse$.get(_.tester.vine)).to.emitSequence([nonCtrlEvent]);

      // ctrl === undefined
      assert($noOption$.get(_.tester.vine)).to.emitSequence([ctrlEvent, nonCtrlEvent]);
    });

    should('match the meta correctly', () => {
      const element = _.tester.createElement(HOST);
      const root = getEl(element, 'el')!;

      // meta === true
      const metaEvent = new KeyboardEvent('keydown', {key: KEY, metaKey: true});
      root.dispatchEvent(metaEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert($metaTrue$.get(_.tester.vine)).to.emitSequence([metaEvent]);

      // meta === false
      const nonMetaEvent = new KeyboardEvent('keydown', {key: KEY});
      root.dispatchEvent(nonMetaEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', metaKey: true}));
      assert($metaFalse$.get(_.tester.vine)).to.emitSequence([nonMetaEvent]);

      // meta === undefined
      assert($noOption$.get(_.tester.vine)).to.emitSequence([metaEvent, nonMetaEvent]);
    });

    should('match the shift correctly', () => {
      const element = _.tester.createElement(HOST);
      const root = getEl(element, 'el')!;

      // shift === true
      const shiftEvent = new KeyboardEvent('keydown', {key: KEY, shiftKey: true});
      root.dispatchEvent(shiftEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other'}));
      assert($shiftTrue$.get(_.tester.vine)).to.emitSequence([shiftEvent]);

      // shift === false
      const nonShiftEvent = new KeyboardEvent('keydown', {key: KEY});
      root.dispatchEvent(nonShiftEvent);
      root.dispatchEvent(new KeyboardEvent('keydown', {key: 'other', shiftKey: true}));
      assert($shiftFalse$.get(_.tester.vine)).to.emitSequence([nonShiftEvent]);

      // shift === undefined
      assert($noOption$.get(_.tester.vine)).to.emitSequence([shiftEvent, nonShiftEvent]);
    });

    should('ignore if event is not KeyboardEvent', () => {
      const element = _.tester.createElement(HOST);
      const root = getEl(element, 'el')!;

      root.dispatchEvent(new CustomEvent<unknown>('keydown'));
      assert($noOption$.get(_.tester.vine)).toNot.emit();
    });
  });
});