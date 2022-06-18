import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderHtml} from './types/render-html-spec';
import {RenderSpec} from './types/render-spec';


const $spec = source(() => new Subject<RenderSpec|null>());

const $host = {
  shadow: {
    root: root({
      value: ocase<RenderSpec|null>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(this.$.shadow.root.value(spec => spec)),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #ref -->',
});


test('@persona/src/render/render-html', init => {
  const SUPPORTED_TYPE = 'text/html';

  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));

    const tester = setupTest({
      roots: [HOST],
    });

    return {tester};
  });

  should('emit the parse result', () => {
    const el = document.createElement('div');

    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderHtml({
      raw: of(el.outerHTML),
      parseType: SUPPORTED_TYPE,
    }));

    assert(element).to.matchSnapshot('render-html.html');
  });
});
