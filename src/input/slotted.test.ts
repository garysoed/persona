import {source} from 'grapevine';
import {arrayThat, assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {SLOT} from '../html/slot';
import {id} from '../selector/id';
import {getHarness} from '../testing/harness/get-harness';
import {SlotHarness} from '../testing/harness/slot-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';


const $elValue$ = source(() => new ReplaySubject<readonly Node[]>());


const $host = {
  shadow: {
    slot: id('slot', SLOT),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.slot.slotted.pipe(
          tap(value => $elValue$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<slot id="slot"></slot>',
});


test('@persona/src/input/attr', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('emit values on sets', () => {
      const element = _.tester.createElement(HOST);
      const newNode = document.createTextNode('text');
      getHarness(element, 'slot', SlotHarness).simulateSlotChange(element => {
        element.appendChild(newNode);
      });

      assert($elValue$.get(_.tester.vine)).to.emitSequence([
        arrayThat<Node>().haveExactElements([]),
        arrayThat<Node>().haveExactElements([newNode]),
      ]);
    });
  });
});
