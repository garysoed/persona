import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
import {osingle} from '../output/single';
import {root} from '../selector/root';
import {flattenNode} from '../testing/flatten-node';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderCustomElement} from './types/render-custom-element-spec';
import {RenderSpec} from './types/render-spec';


const $child = {
  host: {
    a: iattr('a'),
    b: iflag('b'),
  },
};

class Child implements Ctrl {
  readonly runs = [];
}

const CHILD = registerCustomElement({
  tag: 'pr-test',
  ctrl: Child,
  spec: $child,
  template: '<div>child<slot></slot></div>',
});

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

test('@persona/render/render-custom-element', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src-next/render/goldens', goldens));
    const tester = setupTest({roots: [HOST, CHILD]});
    return {tester};
  });

  should('emit the custom element', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderCustomElement({
      registration: CHILD,
      inputs: {
        a: of('avalue'),
        b: of(true),
      },
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-custom-element__emit.html');
  });

  should('update the inputs', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderCustomElement({
      registration: CHILD,
      inputs: {
        a: of('a1', 'a2'),
        b: of(true, false),
      },
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-custom-element__update.html');
  });

  should('update the extra attributes', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderCustomElement({
      registration: CHILD,
      inputs: {
        a: of('a'),
        b: of(true),
      },
      attrs: new Map([['c', of('c1', 'c2')]]),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-custom-element__extra_attr.html');
  });

  should('update the text context', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderCustomElement({
      registration: CHILD,
      inputs: {
        a: of('a'),
        b: of(true),
      },
      textContent: of('text1', 'text2'),
      id: 'id',
    }));

    assert(flattenNode(element)).to.matchSnapshot('render-custom-element__text.html');
  });
});
