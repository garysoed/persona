import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {oforeach} from '../output/foreach';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
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

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $value.get(this.$.vine).pipe(
          map(value => [value]),
          this.$.shadow.el.value(map(value => {
            return renderFragment({
              nodes: value.map(text => renderTextNode({textContent: of(text)})),
            });
          })),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #ref -->',
});


test('@persona/src/output/render-fragment', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('render-fragment__empty.golden');

      $value.get(_.tester.vine).next(['one', 'two', 'three']);
      assert(snapshotElement(element)).to.match('render-fragment__value.golden');

      $value.get(_.tester.vine).next([]);
      assert(snapshotElement(element)).to.match('render-fragment__reset.golden');
    });
  });
});
