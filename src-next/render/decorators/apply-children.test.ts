import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../../core/register-custom-element';
import {osingle} from '../../output/single';
import {root} from '../../selector/root';
import {flattenNode} from '../../testing/flatten-node';
import {setupTest} from '../../testing/setup-test';
import {Context, Ctrl} from '../../types/ctrl';
import {renderNode} from '../types/render-node-spec';
import {RenderSpec} from '../types/render-spec';
import {renderTextNode} from '../types/render-text-node-spec';

import {applyChildren} from './apply-children';
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
  template: '<!-- #ref --></div>',
});

test('@persona/render/decorators/apply-children', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/decorators/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('delete the children correctly', () => {
    const child1 = renderTextNode({
      id: {},
      textContent: 'child1',
    });
    const child2 = renderTextNode({
      id: {},
      textContent: 'child2',
    });

    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderNode({
      id: {},
      node: document.createElement('a'),
      decorators: [
        applyChildren(of([child1, child2], [child1]), document),
      ],
    }));

    assert(flattenNode(element)).to.matchSnapshot('apply-children__delete.html');
  });

  should('insert the children correctly', () => {
    const child1 = renderTextNode({
      id: {},
      textContent: 'child1',
    });
    const child2 = renderTextNode({
      id: {},
      textContent: 'child2',
    });

    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderNode({
      id: {},
      node: document.createElement('a'),
      decorators: [
        applyChildren(of([child2], [child1, child2]), document),
      ],
    }));

    assert(flattenNode(element)).to.matchSnapshot('apply-children__insert.html');
  });

  should('set the children correctly', () => {
    const child1 = renderTextNode({
      id: {},
      textContent: 'child1',
    });
    const child2 = renderTextNode({
      id: {},
      textContent: 'child2',
    });

    const element = _.tester.createElement(HOST);

    $spec.get(_.tester.vine).next(renderNode({
      id: {},
      node: document.createElement('a'),
      decorators: [
        applyChildren(of([child2], [child1]), document),
      ],
    }));

    assert(flattenNode(element)).to.matchSnapshot('apply-children__set.html');
  });
});
