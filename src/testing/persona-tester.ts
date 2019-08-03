import { Vine } from '@grapevine';
import { fake, runEnvironment, spy } from '@gs-testing';
import { Errors } from '@gs-tools/error';

import { Builder as PersonaBuilder } from '../core/builder';
import { MediaQueryInput } from '../input/media-query';
import { CustomElementCtrlCtor } from '../types/custom-element-ctrl';

import { ElementTester } from './element-tester';
import { FakeCustomElementRegistry } from './fake-custom-element-registry';
import { FakeTime } from './fake-time';
import { FakeMediaQuery, mockMatchMedia } from './mock-match-media';
import { PersonaTesterEnvironment } from './persona-tester-environment';

// TODO: This needs to be moved to build.
runEnvironment(new PersonaTesterEnvironment());

/**
 * Used to test UI implemented using Persona.
 */
export class PersonaTester {
  constructor(
      readonly vine: Vine,
      readonly time: FakeTime,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  createElement<T extends HTMLElement>(tag: string, parent: HTMLElement|null): ElementTester<T> {
    const element = this.customElementRegistry.create(tag, parent) as T;

    return new ElementTester(element, this.vine);
  }

  setMedia(input: MediaQueryInput, value: boolean): void {
    const mediaQuery = window.matchMedia(input.query);
    if (!(mediaQuery instanceof FakeMediaQuery)) {
      throw Errors.assert('mediaQuery').shouldBeAnInstanceOf(FakeMediaQuery).butWas(mediaQuery);
    }

    (mediaQuery as FakeMediaQuery).matches = value;
  }
}

/**
 * Test UI elements built by Persona.
 *
 * Instantiate the factory once. You will need to call build at the beginning of every test.
 */
export class PersonaTesterFactory {
  constructor(
      private readonly personaBuilder: PersonaBuilder,
  ) { }

  build(rootCtors: CustomElementCtrlCtor[]): PersonaTester {
    // tslint:disable-next-line: deprecation
    const origCreateElement = document.createElement;
    const createElement = (tag: string) => origCreateElement.call(document, tag);
    const customElementRegistry = new FakeCustomElementRegistry(createElement);

    const {vine} = this.personaBuilder.build(
        'test',
        rootCtors,
        customElementRegistry,
    );

    const fakeTime = new FakeTime();
    fakeTime.install(window);

    const tester = new PersonaTester(vine, fakeTime, customElementRegistry);
    fake(spy(document, 'createElement'))
        .always().call(tag => {
          if (customElementRegistry.get(tag)) {
            const elTester = tester.createElement(tag, null);

            return elTester.element;
          } else {
            return createElement(tag);
          }
        });

    mockMatchMedia(window);

    return tester;
  }
}
