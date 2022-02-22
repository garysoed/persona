import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {unknownType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../../core/register-custom-element';
import {ocase} from '../../output/case';
import {root} from '../../selector/root';
import {setupTest} from '../../testing/setup-test';
import {Context, Ctrl} from '../../types/ctrl';
import {renderNode} from '../types/render-node-spec';
import {RenderSpec} from '../types/render-spec';

import {applyTextContent} from './apply-text-content';
import goldens from './goldens/goldens.json';


const $spec = source(() => new Subject<RenderSpec|null>());

const $host = {
  shadow: {
    el: root({
      value: ocase('#ref', unknownType),
    }),
  },
};

class Host implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      of({}).pipe(this.$.shadow.el.value(() => $spec.get(this.$.vine))),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: Host,
  spec: $host,
  template: '<!-- #ref -->',
});


test('@persona/src/render/decorators/apply-text-content', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/decorators/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('update the textContent', () => {
    const element = _.tester.createElement(HOST);

    const text1 = 'text1';
    const text2 = 'text2';

    $spec.get(_.tester.vine).next(renderNode({
      node: document.createElement('a'),
      decorators: [
        applyTextContent(of(text1, text2)),
      ],
    }));

    assert(element).to.matchSnapshot('apply-text-content__update.html');
  });
});
