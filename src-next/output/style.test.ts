import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {flattenNode} from '../../src/testing/flatten-node';
import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {id} from '../selector/id';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {ostyle} from './style';


const $elValue$ = source(() => new Subject<string>());

const $host = {
  shadow: {
    el: id('el', DIV, {
      value: ostyle('height'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<div id="el"></div>',
});


test('@persona/src/output/style', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/output/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('set the style correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(flattenNode(element)).to.matchSnapshot('style__el_empty.html');

      $elValue$.get(_.tester.vine).next('123px');
      assert(flattenNode(element)).to.matchSnapshot('style__el_value.html');
    });
  });
});
