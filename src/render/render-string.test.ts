import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {ocase} from '../output/case';
import {otext} from '../output/text';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {RenderSpec} from './types/render-spec';
import {renderString} from './types/render-string-spec';


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


test('@persona/src/render/render-string', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));

    const tester = setupTest({
      roots: [HOST],
    });

    return {tester};
  });

  should('emit the parse result', () => {
    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderString({
      raw: of('<div></div>'),
      parseType: 'application/xhtml+xml',
      spec: {
        div: query(null, DIV, {
          text: otext(),
        }),
      },
      runs: $ => [
        of('text content').pipe($.div.text()),
      ],
    }));

    assert(element).to.matchSnapshot('render-string.html');
  });
});
