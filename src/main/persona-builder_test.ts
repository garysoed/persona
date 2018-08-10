import { VineBuilder } from 'grapevine/export/main';
import { InstanceSourceProvider } from 'grapevine/src/node/instance-source-provider';
import { assert, match, should } from 'gs-testing/export/main';
import { createSpyInstance, createSpyObject } from 'gs-testing/export/spy';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { InstanceofType } from 'gs-types/export';
import { element } from '../locator/element-locator';
import { ComponentSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { SHADOW_ROOT } from './custom-element-impl';
import { PersonaBuilder } from './persona-builder';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(): void {
    // noop
  }
}

describe('main.PersonaBuilder', () => {
  let customElementsAnnotationsCache: Annotations<ComponentSpec>;
  let builder: PersonaBuilder;

  beforeEach(() => {
    customElementsAnnotationsCache = Annotations.of<ComponentSpec>(Symbol('test'));
    builder = new PersonaBuilder(customElementsAnnotationsCache);
  });

  describe('register', () => {
    should(`register the components correctly`, () => {
      const tag = 'tag';
      const template = 'template';
      const mockCustomElementRegistry =
          createSpyObject<CustomElementRegistry>('CustomElementRegistry', ['define']);
      const vineBuilder = new VineBuilder();
      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        tag,
        template,
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

      builder.register([TestClass], vineBuilder);
      builder.build(mockCustomElementRegistry, vineBuilder.run());

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, match.anyThing());
    });

    should(`register the watchers correctly`, async () => {
      const tag = 'tag';
      const template = 'template';
      const mockVineBuilder = createSpyInstance('VineBuilder', VineBuilder.prototype);
      const locator1 = element('section', InstanceofType(HTMLElement));
      const locator2 = element('a', InstanceofType(HTMLElement));

      const anchorEl = document.createElement('a');
      const sectionEl = document.createElement('section');
      const rootEl = document.createElement('div');
      rootEl.appendChild(anchorEl);
      rootEl.appendChild(sectionEl);

      const context = new TestClass();
      (context as any)[SHADOW_ROOT] = rootEl;

      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        tag,
        template,
        watchers: ImmutableSet.of([locator1, locator2]),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

      builder.register([TestClass], mockVineBuilder);

      const providerMatcher = match.anyThat<InstanceSourceProvider<HTMLElement>>().beAFunction();
      assert(mockVineBuilder.sourceWithProvider).to
          .haveBeenCalledWith(locator1.getReadingId(), providerMatcher);
      assert(await providerMatcher.getLastMatch()(context)).to.equal(sectionEl);
      assert(mockVineBuilder.sourceWithProvider)
          .to.haveBeenCalledWith(locator2.getReadingId(), providerMatcher);
      assert(await providerMatcher.getLastMatch()(context)).to.equal(anchorEl);
    });

    should(`throw error if the tag is already registered`, () => {
      const tag = 'tag';
      const template = 'template';
      const vineBuilder = new VineBuilder();

      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        tag,
        template,
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

      builder.register([TestClass], vineBuilder);

      assert(() => {
        builder.register([TestClass], vineBuilder);
      }).to.throwErrorWithMessage(/unregistered/);
    });

    should(`throw error if annotations does not exist`, () => {
      const vineBuilder = new VineBuilder();

      assert(() => {
        builder.register([TestClass], vineBuilder);
      }).to.throwErrorWithMessage(/Annotations for/);
    });
  });
});
