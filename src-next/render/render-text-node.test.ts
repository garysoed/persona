import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {osingle} from '../output/single';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderTextNode} from './types/render-text-node-spec';


const $text = source(() => new Subject<string>());

const $host = {
  shadow: {
    el: root({
      value: osingle('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $text.get(this.$.vine).pipe(
          map(textContent => renderTextNode({id: {}, textContent})),
          this.$.shadow.el.value(),
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
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
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
