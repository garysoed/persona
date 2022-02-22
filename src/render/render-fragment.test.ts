import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {arrayOfType, stringType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {oforeach} from '../output/foreach';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderFragment} from './types/render-fragment-spec';
import {renderTextNode} from './types/render-text-node-spec';


const $value = source(() => new Subject<readonly string[]>());

const $host = {
  shadow: {
    el: root({
      value: oforeach('#ref', arrayOfType(stringType)),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $value.get(this.$.vine).pipe(
          map(value => [value]),
          this.$.shadow.el.value(value => {
            return of(renderFragment({
              nodes: value.map(text => renderTextNode({textContent: of(text), id: text})),
              id: value,
            }));
          }),
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


test('@persona/src/output/render-fragment', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('el', () => {
    should('update values correctly', () => {
      const element = _.tester.createElement(HOST);

      assert(element).to.matchSnapshot('render-fragment__empty.html');

      $value.get(_.tester.vine).next(['one', 'two', 'three']);
      assert(element).to.matchSnapshot('render-fragment__value.html');

      $value.get(_.tester.vine).next([]);
      assert(element).to.matchSnapshot('render-fragment__reset.html');
    });
  });
});
