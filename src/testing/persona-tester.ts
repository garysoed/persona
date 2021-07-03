import {Config as VineConfig, Vine} from 'grapevine';
import {fake, FakeTime, mockTime, runEnvironment, spy} from 'gs-testing';
import {Subject} from 'rxjs';

import {PersonaContext} from '../../export';
import {BaseCtrlCtor} from '../core/base-ctrl';
import {Builder as PersonaBuilder} from '../core/builder';
import {MediaQueryInput} from '../input/media-query';

import {ElementTester} from './element-tester';
import {FakeCustomElementRegistry} from './fake-custom-element-registry';
import {createHarness, Harness} from './harness';
import {FakeMediaQuery, mockMatchMedia} from './mock-match-media';
import {PersonaTesterEnvironment} from './persona-tester-environment';


interface Config {
  readonly rootCtrls?: ReadonlyArray<BaseCtrlCtor<{}>>;
  readonly rootDoc: Document;
  readonly overrides?: VineConfig['overrides'];
}

interface ElementAndHarness<S> {
  readonly element: Element;
  readonly harness: Harness<S>;
}


// TODO: Should only use the API, not the private $
// TODO: Add snapshot getter
/**
 * Used to test UI implemented using Persona.
 */
export class PersonaTester {
  constructor(
      readonly fakeTime: FakeTime,
      readonly vine: Vine,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  /**
   * @deprecated Use #createHarness
   */
  createElement<T extends HTMLElement>(tagOrCtrl: BaseCtrlCtor<{}>): ElementTester<T> {
    const element = this.customElementRegistry.create(tagOrCtrl) as T;

    return new ElementTester(element);
  }

  createHarness<S>(ctrl: BaseCtrlCtor<S>): ElementAndHarness<S> {
    const element = this.customElementRegistry.create(ctrl);
    const context: PersonaContext = {
      onAttributeChanged$: new Subject(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      shadowRoot: element.shadowRoot!,
      vine: this.vine,
    };

    const tmp = new ctrl(context);
    const harness = createHarness(tmp.specs, context);
    return {element, harness};
  }

  setMedia(input: MediaQueryInput, value: boolean): void {
    const mediaQuery = window.matchMedia(input.query);
    if (!(mediaQuery instanceof FakeMediaQuery)) {
      throw new Error(`mediaQuery should be a ${FakeMediaQuery} but was ${mediaQuery}`);
    }

    (mediaQuery as FakeMediaQuery).matches = value;
  }

  testElement<T extends HTMLElement>(element: T): ElementTester<T> {
    return new ElementTester(element);
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

  build(config: Config): PersonaTester {
    const origCreateElement = document.createElement;
    function createElement(tag: string): HTMLElement {
      return origCreateElement.call(document, tag);
    }
    const fakeTime = mockTime(window);
    const customElementRegistry = new FakeCustomElementRegistry(createElement, fakeTime, this.personaBuilder);
    const vine = new Vine({appName: 'test', overrides: config.overrides});

    this.personaBuilder.build({
      customElementRegistry,
      rootCtrls: [],
      vine,
      ...config,
    });

    const tester = new PersonaTester(fakeTime, vine, customElementRegistry);
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
}
