import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {stringType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderTextNode} from './types/render-text-node-spec';


const $text = source(() => new Subject<string>());

const $host = {
  shadow: {
    el: root({
      value: ocase('#ref', stringType),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $text.get(this.$.vine).pipe(
          this.$.shadow.el.value(textContent => {
            return of(renderTextNode({textContent: of(textContent)}));
          }),
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

test('@persona/src/render/render-text-node', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('emit the text node', () => {
    const element = _.tester.createElement(HOST);

    const textContent = 'textContent';
    $text.get(_.tester.vine).next(textContent);

    assert(element).to.matchSnapshot('render-text-node.html');
  });
});
