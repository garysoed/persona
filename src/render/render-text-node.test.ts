import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

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

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $text.get(this.$.vine).pipe(
        this.$.shadow.el.value(
          map((textContent) => {
            return renderTextNode({textContent: of(textContent)});
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

test('@persona/src/render/render-text-node', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('emit the text node', async () => {
    const element = _.tester.bootstrapElement(HOST);

    const textContent = 'textContent';
    $text.get(_.tester.vine).next(textContent);

    await asyncAssert(snapshotElement(element)).to.match('render-text-node');
  });
});
