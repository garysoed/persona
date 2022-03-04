import {Config as VineConfig, Vine} from 'grapevine';
import {fake, FakeTime, mockTime, runEnvironment, spy} from 'gs-testing';
import {getOrigFn} from 'gs-testing/src/spy/spy';
import {arrayFrom} from 'gs-tools/export/collect';

import {installCustomElements} from '../core/install-custom-elements';
import {Spec} from '../types/ctrl';
import {Registration} from '../types/registration';

import {FakeCustomElementRegistry} from './fake-custom-element-registry';
import {FakeMediaQuery, mockMatchMedia} from './mock-match-media';
import {PersonaTesterEnvironment} from './persona-tester-environment';


export interface TestSpec {
  readonly roots?: ReadonlyArray<Registration<HTMLElement, any>>;
  readonly overrides?: VineConfig['overrides'];
}

export class Tester {
  constructor(
      readonly fakeTime: FakeTime,
      readonly vine: Vine,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  createElement<E extends HTMLElement, S extends Spec>(spec: Registration<E, S>): E {
    return this.customElementRegistry.create(spec.tag) as E;
  }

  setMedia(query: string, value: boolean): void {
    const mediaQuery = window.matchMedia(query);
    if (!(mediaQuery instanceof FakeMediaQuery)) {
      throw new Error(`mediaQuery should be a ${FakeMediaQuery} but was ${mediaQuery}`);
    }

    (mediaQuery as FakeMediaQuery).matches = value;
  }
}

export function setupTest(spec: TestSpec): Tester {
  const vine = new Vine({appName: 'test', overrides: spec.overrides});

  const origCreateElement = document.createElement;
  function createElement(tag: string): HTMLElement {
    return origCreateElement.call(document, tag);
  }
  const fakeTime = mockTime(window);
  const registrationMap = new Map<string, Registration<HTMLElement, Spec>>();
  const customElementRegistry = new FakeCustomElementRegistry(
      createElement,
      registrationMap,
      vine,
  );

  const registrations = installCustomElements({
    customElementRegistry,
    rootDoc: document,
    roots: [],
    vine,
    ...spec,
  });

  for (const [tag, registration] of registrations) {
    registrationMap.set(tag, registration);
  }

  const tester = new Tester(fakeTime, vine, customElementRegistry);
  fake(spy(document, 'createElement'))
      .always().call(tag => {
        try {
          return customElementRegistry.create(tag);
        } catch (e) {
          return createElement(tag);
        }
      });

  const spyAppendChild = spy(Node.prototype, 'appendChild');
  fake(spyAppendChild)
      .always()
      .call(function(this: Node, node: Node): Node {
        recursiveUpgradeNode(node, customElementRegistry);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newNode = getOrigFn(spyAppendChild)!.call(this, node);

        return newNode;
      });

  const spyInsertBefore = spy(Node.prototype, 'insertBefore');
  fake(spyInsertBefore)
      .always()
      .call(function(this: Node, node: Node, child: Node|null): Node {
        recursiveUpgradeNode(node, customElementRegistry);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const newNode = getOrigFn(spyInsertBefore)!.call(this, node, child);

        return newNode;
      });
  mockMatchMedia(window);
  runEnvironment(new PersonaTesterEnvironment());

  return tester;
}

function recursiveUpgradeNode(node: Node, fakeRegistry: FakeCustomElementRegistry): void {
  if (node instanceof HTMLElement) {
    fakeRegistry.upgradeElement(node);
  }

  for (const child of arrayFrom(node.childNodes)) {
    recursiveUpgradeNode(child, fakeRegistry);
  }
}
