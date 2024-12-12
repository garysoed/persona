import {source} from 'grapevine';
import {arrayThat, asyncAssert, setup, should, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {SLOT} from '../html/slot';
import {query} from '../selector/query';
import {getHarness} from '../testing/harness/get-harness';
import {SlotHarness} from '../testing/harness/slot-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

const $elValue$ = source(() => new ReplaySubject<readonly Node[]>());

const $host = {
  shadow: {
    slot: query('#slot', SLOT),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.slot.slotted.pipe(
        tap((value) => $elValue$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<slot id="slot"></slot>',
});

test('@persona/src/input/attr', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('emit values on sets', async () => {
      const element = _.tester.bootstrapElement(HOST);
      const newNode = document.createTextNode('text');
      getHarness(element, '#slot', SlotHarness).simulateSlotChange(
        (element) => {
          element.appendChild(newNode);
        },
      );

      await asyncAssert($elValue$.get(_.tester.vine)).to.emitSequence([
        arrayThat<Node>().haveExactElements([]),
        arrayThat<Node>().haveExactElements([newNode]),
      ]);
    });
  });
});
