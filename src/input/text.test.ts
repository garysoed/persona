import {source} from 'grapevine';
import {asyncAssert, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Observable, ReplaySubject, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {triggerFakeMutation} from '../testing/fake-mutation-observer';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {itext} from './text';

const $hostValue$ = source(() => new ReplaySubject<string>());
const $elValue$ = source(() => new ReplaySubject<string>());
const $shadowValue$ = source(() => new Subject<string>());

const $host = {
  host: {
    text: itext(),
  },
  shadow: {
    div: query('#div', DIV, {
      text: itext(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.host.text.pipe(forwardTo($hostValue$.get(this.$.vine))),
      this.$.shadow.div.text.pipe(forwardTo($elValue$.get(this.$.vine))),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<div id="div"></div>',
});

const $shadow = {
  shadow: {
    deps: query('#deps', HOST),
  },
};

class ShadowCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $shadow>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $shadowValue$
        .get(this.context.vine)
        .pipe(this.context.shadow.deps.text()),
    ];
  }
}

const SHADOW = registerCustomElement({
  ctrl: ShadowCtrl,
  deps: [HOST],
  spec: $shadow,
  tag: 'test-shadow',
  template: '<test-host id="deps"></test-host>',
});

test('@persona/src/input/text', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [HOST, SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const text = 'text';
      element.textContent = text;
      triggerFakeMutation(element, {});

      await asyncAssert($hostValue$.get(_.tester.vine)).to.emitSequence([
        '',
        text,
      ]);
    });
  });

  test('el', () => {
    should('emit values on sets', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const text = 'text';
      const div = getHarness(element, '#div', ElementHarness).target;
      div.textContent = text;
      triggerFakeMutation(div, {});

      await asyncAssert($elValue$.get(_.tester.vine)).to.emitSequence([
        '',
        text,
      ]);
    });
  });

  test('shadow', () => {
    should('emit values on sets', async () => {
      _.tester.bootstrapElement(SHADOW);
      const text = 'text';
      $shadowValue$.get(_.tester.vine).next(text);

      await asyncAssert($hostValue$.get(_.tester.vine)).to.emitSequence([
        '',
        text,
      ]);
    });
  });
});
