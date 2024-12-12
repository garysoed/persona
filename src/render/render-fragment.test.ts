import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {oforeach} from '../output/foreach';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {renderFragment} from './types/render-fragment-spec';
import {renderTextNode} from './types/render-text-node-spec';

const $value = source(() => new Subject<readonly string[]>());

const $host = {
  shadow: {
    el: root({
      value: oforeach<readonly string[]>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $value.get(this.$.vine).pipe(
        map((value) => [value]),
        this.$.shadow.el.value(
          map((value) => {
            return renderFragment({
              nodes: value.map((text) =>
                renderTextNode({textContent: of(text)}),
              ),
            });
          }),
        ),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<!-- #ref -->',
});

test('@persona/src/output/render-fragment', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);

      await asyncAssert(snapshotElement(element)).to.match(
        'render-fragment__empty',
      );

      $value.get(_.tester.vine).next(['one', 'two', 'three']);
      await asyncAssert(snapshotElement(element)).to.match(
        'render-fragment__value',
      );

      $value.get(_.tester.vine).next([]);
      await asyncAssert(snapshotElement(element)).to.match(
        'render-fragment__reset',
      );
    });
  });
});
