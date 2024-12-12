import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {ocase} from '../output/case';
import {otext} from '../output/text';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {ParseType} from './html-parse-service';
import {RenderSpec} from './types/render-spec';
import {renderString} from './types/render-string-spec';

const $spec = source(() => new Subject<RenderSpec | null>());

const $host = {
  shadow: {
    root: root({
      value: ocase<RenderSpec | null>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(this.$.shadow.root.value((spec) => spec)),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<!-- #ref -->',
});

test('@persona/src/render/render-string', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));

    const tester = setupTest({
      roots: [HOST],
    });

    return {tester};
  });

  should('emit the parse result', async () => {
    const element = _.tester.bootstrapElement(HOST);

    $spec.get(_.tester.vine).next(
      renderString({
        parseType: ParseType.HTML,
        raw: of('<div></div>'),
        runs: ($) => [of('text content').pipe($.div.text())],
        spec: {
          div: query(null, DIV, {
            text: otext(),
          }),
        },
      }),
    );

    await asyncAssert(snapshotElement(element)).to.match('render-string');
  });
});
