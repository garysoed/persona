import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {Observable, ReplaySubject} from 'rxjs';

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

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.$.host.text.pipe(forwardTo($hostValue$.get(this.$.vine))),
      this.$.shadow.div.text.pipe(forwardTo($elValue$.get(this.$.vine))),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="div"></div>',
});


test('@persona/src/input/text', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', () => {
      const element = _.tester.createElement(HOST);
      const text = 'text';
      element.textContent = text;
      triggerFakeMutation(element, {});

      assert($hostValue$.get(_.tester.vine)).to.emitSequence(['', text]);
    });
  });

  test('el', () => {
    should('emit values on sets', () => {
      const element = _.tester.createElement(HOST);
      const text = 'text';
      const div = getHarness(element, '#div', ElementHarness).target;
      div.textContent = text;
      triggerFakeMutation(div, {});

      assert($elValue$.get(_.tester.vine)).to.emitSequence(['', text]);
    });
  });
});
