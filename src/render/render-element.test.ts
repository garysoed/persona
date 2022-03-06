import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {unknownType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderElement} from './types/render-element-spec';
import {RenderSpec} from './types/render-spec';


const $spec = source(() => new Subject<RenderSpec|null>());

const $host = {
  shadow: {
    root: root({
      value: ocase('#ref', unknownType),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      of({}).pipe(this.$.shadow.root.value(() => $spec.get(this.$.vine))),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #ref -->',
});

test('@persona/src/render/render-element', init => {
  const TAG = 'pr-test';

  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('emit the element', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
    }));

    assert(element).to.matchSnapshot('render-element__emit.html');
  });
});
