import {Config as VineConfig, Vine} from 'grapevine';
import {fake, FakeTime, mockTime, runEnvironment, spy} from 'gs-testing';

import {installCustomElements} from '../core/install-custom-elements';
import {Context} from '../types/ctrl';
import {Registration} from '../types/registration';

import {FakeCustomElementRegistry} from './fake-custom-element-registry';
import {mockMatchMedia} from './mock-match-media';
import {PersonaTesterEnvironment} from './persona-tester-environment';


interface TestSpec {
  readonly roots?: readonly Registration[];
  readonly overrides?: VineConfig['overrides'];
}

export class Tester {
  constructor(
      readonly fakeTime: FakeTime,
      readonly vine: Vine,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  createElement<T extends CustomElementConstructor>(spec: Registration<T>): Context<T> {
    const element = this.customElementRegistry.create(spec.tag);
    return {element, vine: this.vine};
  }
}

export function setupTest(spec: TestSpec): Tester {
  const vine = new Vine({appName: 'test', overrides: spec.overrides});

  const origCreateElement = document.createElement;
  function createElement(tag: string): HTMLElement {
    return origCreateElement.call(document, tag);
  }
  const fakeTime = mockTime(window);
  const registrationMap = new Map<string, Registration>();
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

  for (const registration of registrations) {
    registrationMap.set(registration.tag, registration);
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
  mockMatchMedia(window);
  runEnvironment(new PersonaTesterEnvironment());

  return tester;
}
