import {Config as VineConfig, Vine} from 'grapevine';
import {Environment, fake, FakeTime, mockTime, runEnvironment, spy} from 'gs-testing';
import {getOrigFn} from 'gs-testing/src/spy/spy';
import {arrayFrom} from 'gs-tools/export/collect';

import {installCustomElements} from '../core/install-custom-elements';
import {Spec} from '../types/ctrl';
import {CustomElementRegistration} from '../types/registration';

import {FakeCustomElementRegistry} from './fake-custom-element-registry';
import {FakeMediaQuery, mockMatchMedia} from './mock-match-media';
import {PersonaTesterEnvironment} from './persona-tester-environment';


interface DecoratedElement {
  connectedCallback(): void;
  disconnectedCallback(): void;
}

export interface TestSpec {
  readonly roots?: ReadonlyArray<CustomElementRegistration<HTMLElement, any>>;
  readonly overrides?: VineConfig['overrides'];
}

export class Tester {
  private readonly addedNodes: Node[] = [];

  constructor(
      readonly fakeTime: FakeTime,
      readonly vine: Vine,
      private readonly customElementRegistry: FakeCustomElementRegistry,
  ) { }

  addToBody(node: Node): void {
    this.addedNodes.push(node);
    document.body.appendChild(node);
  }

  bootstrapElement<E extends HTMLElement, S extends Spec>(
      spec: CustomElementRegistration<E, S>,
  ): E & DecoratedElement {
    const element = this.customElementRegistry.create(spec.namespace, spec.tag) as
        E & DecoratedElement;
    this.addToBody(element);
    return element;
  }

  setMedia(query: string, value: boolean): void {
    const mediaQuery = window.matchMedia(query);
    if (!(mediaQuery instanceof FakeMediaQuery)) {
      throw new Error(`mediaQuery should be a ${FakeMediaQuery} but was ${mediaQuery}`);
    }

    (mediaQuery as FakeMediaQuery).matches = value;
  }

  teardown(): void {
    for (const node of this.addedNodes) {
      try {
        document.body.removeChild(node);
      } catch {
        // noop
      }
    }
  }
}

class TesterEnvironment extends Environment {
  constructor(private readonly tester: Tester) {
    super();
  }

  protected innerAfterEach(): void {
    this.tester.teardown();
  }

  protected innerBeforeEach(): void {
    // noop
  }
}

export function setupTest(spec: TestSpec): Tester {
  const vine = new Vine({overrides: spec.overrides});

  const fakeTime = mockTime(window);
  const registrationMap = new Map<string, CustomElementRegistration<HTMLElement, Spec>>();

  const origCreateElementNS = document.createElementNS;
  function createElementNS(namespaceURI: string|null, tag: string): Element {
    return origCreateElementNS.call(document, namespaceURI, tag);
  }
  fake(spy(Document.prototype, 'createElementNS'))
      .always().call((namespace, tag) => {
        try {
          return customElementRegistry.create(namespace, tag);
        } catch (e) {
          return createElementNS(namespace, tag);
        }
      });

  const customElementRegistry = new FakeCustomElementRegistry(
      createElementNS,
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
  runEnvironment(new TesterEnvironment(tester));

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
