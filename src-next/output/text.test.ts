import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {otext} from './text';


const $elValue$ = source(() => new Subject<string>());
const $rootValue$ = source(() => new Subject<string>());


const $host = {
  shadow: {
    root: root({
      value: otext(),
    }),
    el: id('el', DIV, {
      value: otext(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.$.vine).pipe(
          this.$.shadow.el.value(),
      ),
      $rootValue$.get(this.$.vine).pipe(
          this.$.shadow.root.value(),
      ),
    ];
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


test('@persona/src/output/text', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('set the text content correctly', () => {
      const element = _.tester.createElement(HOST);
      $elValue$.get(_.tester.vine).next('text');

      assert(element).to.matchSnapshot('text__el.html');
    });
  });

  test('root', () => {
    should('set the text content correctly', () => {
      const element = _.tester.createElement(HOST);
      $rootValue$.get(_.tester.vine).next('text');

      assert(element).to.matchSnapshot('text__root.html');
    });
  });
});
