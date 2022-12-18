import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, of, pipe, Subject, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {RenderSpec} from '../render/types/render-spec';
import {renderTextNode} from '../render/types/render-text-node-spec';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {ElementHarness} from '../testing/harness/element-harness';
import {getHarness} from '../testing/harness/get-harness';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ocase} from './case';
import goldens from './goldens/goldens.json';


const $elValue$ = source(() => new Subject<string|null>());
const $elSlottedValue$ = source(() => new Subject<string|null>());
const $rootValue$ = source(() => new Subject<string|null>());
const $rootSlottedValue$ = source(() => new Subject<string|null>());
const $withIdValue$ = source(() => new Subject<readonly [string|null]>());


const $host = {
  shadow: {
    root: root({
      slotted: ocase<string|null>('#root'),
      value: ocase<string|null>(),
      withId: ocase<readonly [string|null]>('#withId', ([value]) => value),
    }),
    el: query('#el', DIV, {
      slotted: ocase<string|null>('#ref'),
      value: ocase<string|null>(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elSlottedValue$.get(this.$.vine).pipe(
          this.$.shadow.el.slotted(this.render()),
      ),
      $elValue$.get(this.$.vine).pipe(
          this.$.shadow.el.value(this.render()),
      ),
      $rootSlottedValue$.get(this.$.vine).pipe(
          this.$.shadow.root.slotted(this.render()),
      ),
      $rootValue$.get(this.$.vine).pipe(
          this.$.shadow.root.value(this.render()),
      ),
      $withIdValue$.get(this.$.vine).pipe(
          this.$.shadow.root.withId(pipe(map(([value]) => value), this.render())),
      ),
    ];
  }

  private render(): OperatorFunction<string|null, RenderSpec|null> {
    return map(text => !text ? null : renderTextNode({textContent: of(text)}));
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: `
  <!-- #root -->
  <div id="el">
    <!-- #ref -->
    other
  </div>
  <!-- #withId -->`,
});


test('@persona/src/output/case', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly if unslotted', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('case__el_empty.golden');

      const node = 'text';
      $elValue$.get(_.tester.vine).next(node);
      assert(snapshotElement(element)).to.match('case__el_value.golden');

      $elValue$.get(_.tester.vine).next(null);
      assert(snapshotElement(element)).to.match('case__el_reset.golden');
    });

    should('update values correctly if slotted', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('case__el_slotted_empty.golden');

      const node = 'text';
      $elSlottedValue$.get(_.tester.vine).next(node);
      assert(snapshotElement(element)).to.match('case__el_slotted_value.golden');

      $elSlottedValue$.get(_.tester.vine).next(null);
      assert(snapshotElement(element)).to.match('case__el_slotted_reset.golden');
    });
  });

  test('root', () => {
    should('update values correctly if unslotted', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('case__root_empty.golden');

      const node = 'text';
      $rootValue$.get(_.tester.vine).next(node);
      assert(snapshotElement(element)).to.match('case__root_value.golden');

      $rootValue$.get(_.tester.vine).next(null);
      assert(snapshotElement(element)).to.match('case__root_reset.golden');
    });

    should('update values correctly if slotted', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('case__root_slotted_empty.golden');

      const node = 'text';
      $rootSlottedValue$.get(_.tester.vine).next(node);
      assert(snapshotElement(element)).to.match('case__root_slotted_value.golden');

      $rootSlottedValue$.get(_.tester.vine).next(null);
      assert(snapshotElement(element)).to.match('case__root_slotted_reset.golden');
    });
  });

  test('withId', () => {
    should('update values correctly if unslotted', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(snapshotElement(element)).to.match('case__with_id_empty.golden');

      const node = 'text';
      $withIdValue$.get(_.tester.vine).next([node]);
      assert(snapshotElement(element)).to.match('case__with_id_value.golden');

      const harness = getHarness(element, ElementHarness);
      const nodeBefore = harness.target.shadowRoot!.lastChild;

      $withIdValue$.get(_.tester.vine).next([node]);
      assert(snapshotElement(element)).to.match('case__with_id_dupe.golden');
      const nodeAfter = harness.target.shadowRoot!.lastChild;

      // The node must be the same.
      assert(nodeAfter).to.equal(nodeBefore);

      $withIdValue$.get(_.tester.vine).next([null]);
      assert(snapshotElement(element)).to.match('case__with_id_reset.golden');
    });
  });
});
