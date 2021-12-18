import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../../core/register-custom-element';
import {osingle} from '../../output/single';
import {root} from '../../selector/root';
import {setupTest} from '../../testing/setup-test';
import {Context, Ctrl} from '../../types/ctrl';
import {renderNode} from '../types/render-node-spec';
import {RenderSpec} from '../types/render-spec';

import {applyStyles} from './apply-styles';
import goldens from './goldens/goldens.json';


const $spec = source(() => new Subject<RenderSpec|null>());

const $host = {
  shadow: {
    el: root({
      value: osingle('#ref'),
    }),
  },
};

class Host implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(this.$.shadow.el.value()),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: Host,
  spec: $host,
  template: '<!-- #ref -->',
});

test('@persona/src/render/decorators/apply-styles', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/decorators/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('add the styles correctly', () => {
    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderNode({
      id: {},
      node: document.createElement('a'),
      decorators: [
        applyStyles(of(new Map([['height', '1px'], ['width', '2px']]))),
      ],
    }));

    assert(element).to.matchSnapshot('apply-styles__add.html');
  });

  should('delete the styles correctly', () => {
    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderNode({
      id: {},
      node: document.createElement('a'),
      decorators: [
        applyStyles(of(
            new Map([['height', '1px'], ['width', '2px']]),
            new Map([['height', '1px']]),
        )),
      ],
    }));

    assert(element).to.matchSnapshot('apply-styles__delete.html');
  });
});
