import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {osingle} from '../output/single';
import {root} from '../selector/root';
import {flattenNode} from '../testing/flatten-node';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderElement} from './types/render-element-spec';
import {RenderSpec} from './types/render-spec';


const $spec = source(() => new Subject<RenderSpec|null>());

const $host = {
  shadow: {
    root: root({
      value: osingle('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(
          this.$.shadow.root.value(),
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

test('@persona/render/render-element', init => {
  const TAG = 'pr-test';

  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  should('emit the element', () => {
    const a = 'avalue';
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      attrs: new Map([['a', of(a)]]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__emit.html');
  });

  should('update the attributes', () => {
    const b1 = 'b1';
    const b2 = 'b2';
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      attrs: new Map([['b', of(b1, b2)]]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__attribute_update.html');
  });

  should('delete the attribute if the value is undefined', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      attrs: new Map([['b', of('bValue', undefined)]]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__attribute_undefined.html');
  });

  should('update the text context', () => {
    const text1 = 'text1';
    const text2 = 'text2';
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      textContent: of(text1, text2),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__text_content.html');
  });

  should('delete the children', () => {
    const child1 = renderElement({
      tag: 'div',
      id: {},
    });
    const child2 = renderElement({
      tag: 'input',
      id: {},
    });
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      children: of([child1, child2], [child1]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__delete_children.html');
  });

  should('insert the children', () => {
    const child1 = renderElement({
      tag: 'div',
      id: {},
    });
    const child2 = renderElement({
      tag: 'input',
      id: {},
    });
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      children: of([child2], [child1, child2]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__insert_children.html');
  });

  should('set the children', () => {
    const child1 = renderElement({
      tag: 'div',
      id: {},
    });
    const child2 = renderElement({
      tag: 'input',
      id: {},
    });
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      tag: TAG,
      children: of([child2], [child1]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-element__set_children.html');
  });
});
