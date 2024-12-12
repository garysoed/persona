import {source} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
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
    el: query('#el', DIV, {
      altFalse: ikeydown(KEY, {alt: false}),
      altTrue: ikeydown(KEY, {alt: true}),
      ctrlFalse: ikeydown(KEY, {ctrl: false}),
      ctrlTrue: ikeydown(KEY, {ctrl: true}),
      metaFalse: ikeydown(KEY, {meta: false}),
      metaTrue: ikeydown(KEY, {meta: true}),
      noOption: ikeydown(KEY),
      shiftFalse: ikeydown(KEY, {shift: false}),
      shiftTrue: ikeydown(KEY, {shift: true}),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.el.altTrue.pipe(
        tap((event) => $altTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.altFalse.pipe(
        tap((event) => $altFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.ctrlTrue.pipe(
        tap((event) => $ctrlTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.ctrlFalse.pipe(
        tap((event) => $ctrlFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.metaTrue.pipe(
        tap((event) => $metaTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.metaFalse.pipe(
        tap((event) => $metaFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.shiftTrue.pipe(
        tap((event) => $shiftTrue$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.shiftFalse.pipe(
        tap((event) => $shiftFalse$.get(this.context.vine).next(event)),
      ),
      this.context.shadow.el.noOption.pipe(
        tap((event) => $noOption$.get(this.context.vine).next(event)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<div id="el"></div>',
});

test('@persona/src/input/keydown', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('match the key correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const harness = getHarness(element, '#el', ElementHarness);

      const event = harness.simulateKeydown(KEY);
      harness.simulateKeydown('other');

      await asyncAssert($noOption$.get(_.tester.vine)).to.emitSequence([event]);
    });

    should('match the alt correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const harness = getHarness(element, '#el', ElementHarness);

      // alt === true
      const altEvent = harness.simulateKeydown(KEY, {altKey: true});
      harness.simulateKeydown('other');
      await asyncAssert($altTrue$.get(_.tester.vine)).to.emitSequence([
        altEvent,
      ]);

      // alt === false
      const nonAltEvent = harness.simulateKeydown(KEY);
      harness.simulateKeydown('other', {altKey: true});
      await asyncAssert($altFalse$.get(_.tester.vine)).to.emitSequence([
        nonAltEvent,
      ]);

      // alt === undefined
      await asyncAssert($noOption$.get(_.tester.vine)).to.emitSequence([
        altEvent,
        nonAltEvent,
      ]);
    });

    should('match the ctrl correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const harness = getHarness(element, '#el', ElementHarness);

      // ctrl === true
      const ctrlEvent = harness.simulateKeydown(KEY, {ctrlKey: true});
      harness.simulateKeydown('other');
      await asyncAssert($ctrlTrue$.get(_.tester.vine)).to.emitSequence([
        ctrlEvent,
      ]);

      // ctrl === false
      const nonCtrlEvent = harness.simulateKeydown(KEY);
      harness.simulateKeydown('other', {ctrlKey: true});
      await asyncAssert($ctrlFalse$.get(_.tester.vine)).to.emitSequence([
        nonCtrlEvent,
      ]);

      // ctrl === undefined
      await asyncAssert($noOption$.get(_.tester.vine)).to.emitSequence([
        ctrlEvent,
        nonCtrlEvent,
      ]);
    });

    should('match the meta correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const harness = getHarness(element, '#el', ElementHarness);

      // meta === true
      const metaEvent = harness.simulateKeydown(KEY, {metaKey: true});
      harness.simulateKeydown('other');
      await asyncAssert($metaTrue$.get(_.tester.vine)).to.emitSequence([
        metaEvent,
      ]);

      // meta === false
      const nonMetaEvent = harness.simulateKeydown(KEY);
      harness.simulateKeydown('other', {metaKey: true});
      await asyncAssert($metaFalse$.get(_.tester.vine)).to.emitSequence([
        nonMetaEvent,
      ]);

      // meta === undefined
      await asyncAssert($noOption$.get(_.tester.vine)).to.emitSequence([
        metaEvent,
        nonMetaEvent,
      ]);
    });

    should('match the shift correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const harness = getHarness(element, '#el', ElementHarness);

      // shift === true
      const shiftEvent = harness.simulateKeydown(KEY, {shiftKey: true});
      harness.simulateKeydown('other');
      await asyncAssert($shiftTrue$.get(_.tester.vine)).to.emitSequence([
        shiftEvent,
      ]);

      // shift === false
      const nonShiftEvent = harness.simulateKeydown(KEY);
      harness.simulateKeydown('other', {shiftKey: true});
      await asyncAssert($shiftFalse$.get(_.tester.vine)).to.emitSequence([
        nonShiftEvent,
      ]);

      // shift === undefined
      await asyncAssert($noOption$.get(_.tester.vine)).to.emitSequence([
        shiftEvent,
        nonShiftEvent,
      ]);
    });

    should('ignore if event is not KeyboardEvent', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const harness = getHarness(element, '#el', ElementHarness);

      harness.target.dispatchEvent(new CustomEvent<unknown>('keydown'));
      await asyncAssert($noOption$.get(_.tester.vine)).toNot.emit();
    });
  });
});
