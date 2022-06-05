import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {nullType, stringType, unionType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {RenderSpec} from '../render/types/render-spec';
import {renderTextNode} from '../render/types/render-text-node-spec';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ocase} from './case';
import goldens from './goldens/goldens.json';


const $elValue$ = source(() => new Subject<string|null>());
const $elSlottedValue$ = source(() => new Subject<string|null>());
const $rootValue$ = source(() => new Subject<string|null>());
const $rootSlottedValue$ = source(() => new Subject<string|null>());


const $host = {
  shadow: {
    root: root({
      slotted: ocase('#root', unionType([stringType, nullType])),
      value: ocase(unionType([stringType, nullType])),
    }),
    el: query('#el', DIV, {
      slotted: ocase('#ref', unionType([stringType, nullType])),
      value: ocase(unionType([stringType, nullType])),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elSlottedValue$.get(this.$.vine).pipe(
          this.$.shadow.el.slotted(value => this.render(value)),
      ),
      $elValue$.get(this.$.vine).pipe(
          this.$.shadow.el.value(value => this.render(value)),
      ),
      $rootSlottedValue$.get(this.$.vine).pipe(
          this.$.shadow.root.slotted(value => this.render(value)),
      ),
      $rootValue$.get(this.$.vine).pipe(
          this.$.shadow.root.value(value => this.render(value)),
      ),
    ];
  }

  private render(text: string|null): RenderSpec|null {
    return !text ? null : renderTextNode({textContent: of(text)});
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
  </div>`,
});


test('@persona/src/output/case', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly if unslotted', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('case__el_empty.html');

      const node = 'text';
      $elValue$.get(_.tester.vine).next(node);
      assert(element).to.matchSnapshot('case__el_value.html');

      $elValue$.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('case__el_reset.html');
    });

    should('update values correctly if slotted', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('case__el_slotted_empty.html');

      const node = 'text';
      $elSlottedValue$.get(_.tester.vine).next(node);
      assert(element).to.matchSnapshot('case__el_slotted_value.html');

      $elSlottedValue$.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('case__el_slotted_reset.html');
    });
  });

  test('root', () => {
    should('update values correctly if unslotted', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('case__root_empty.html');

      const node = 'text';
      $rootValue$.get(_.tester.vine).next(node);
      assert(element).to.matchSnapshot('case__root_value.html');

      $rootValue$.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('case__root_reset.html');
    });

    should('update values correctly if slotted', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('case__root_slotted_empty.html');

      const node = 'text';
      $rootSlottedValue$.get(_.tester.vine).next(node);
      assert(element).to.matchSnapshot('case__root_slotted_value.html');

      $rootSlottedValue$.get(_.tester.vine).next(null);
      assert(element).to.matchSnapshot('case__root_slotted_reset.html');
    });
  });
});
