import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

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
      value: ocase<string>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $text.get(this.$.vine).pipe(
          this.$.shadow.el.value(map(textContent => {
            return renderTextNode({textContent: of(textContent)});
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

test('@persona/src/render/render-text-node', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('emit the text node', () => {
    const element = _.tester.bootstrapElement(HOST);

    const textContent = 'textContent';
    $text.get(_.tester.vine).next(textContent);

    assert(snapshotElement(element)).to.match('render-text-node.golden');
  });
});
