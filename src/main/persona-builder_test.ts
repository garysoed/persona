import { VineBuilder } from 'grapevine/export/main';
import { assert, Match, should } from 'gs-testing/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { StringParser } from 'gs-tools/export/parse';
import { InstanceofType, StringType } from 'gs-types/export';
import { attribute } from '../locator/attribute-locator';
import { element } from '../locator/element-locator';
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
  let builder: PersonaBuilder;

  beforeEach(() => {
    builder = new PersonaBuilder();
  });

  describe('register', () => {
    should(`register the components correctly`, () => {
      const tag = 'tag';
      const templateKey = 'templateKey';
      const mockCustomElementRegistry = jasmine.createSpyObj('CustomElementRegistry', ['define']);
      const vineBuilder = new VineBuilder();

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
          vineBuilder);
      builder.build(mockCustomElementRegistry, vineBuilder.run());

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, Match.anyThing());
    });

    should(`register the watchers correctly`, async () => {
      const tag = 'tag';
      const templateKey = 'templateKey';
      const mockVineBuilder = jasmine.createSpyObj('VineBuilder', ['source', 'sourceWithProvider']);
      const locator1 = element('section', InstanceofType(HTMLElement));
      const locator2 = element('a', InstanceofType(HTMLElement));

      const anchorEl = document.createElement('a');
      const sectionEl = document.createElement('section');
      const rootEl = document.createElement('div');
      rootEl.appendChild(anchorEl);
      rootEl.appendChild(sectionEl);

      const context = new TestClass();
      (context as any)[SHADOW_ROOT] = rootEl;

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of([locator1, locator2]),
          mockVineBuilder);

      assert(mockVineBuilder.sourceWithProvider)
          .to.haveBeenCalledWith(locator1.getSourceId(), Match.anyFunction());
      assert(await mockVineBuilder.sourceWithProvider.calls.argsFor(0)[1](context))
          .to.be(sectionEl);
      assert(mockVineBuilder.sourceWithProvider)
          .to.haveBeenCalledWith(locator2.getSourceId(), Match.anyFunction());
      assert(await mockVineBuilder.sourceWithProvider.calls.argsFor(1)[1](context))
          .to.be(anchorEl);
    });

    should(`register the renderers correctly`, () => {
      const tag = 'tag';
      const templateKey = 'templateKey';
      const mockVineBuilder = jasmine.createSpyObj('VineBuilder', ['source']);
      const elementLocator = element('div', InstanceofType(HTMLElement));

      const locator1 = attribute(elementLocator, 'attr', StringParser, StringType);
      spyOn(locator1, 'setupVine');
      const rendererSpec1 = {locator: locator1, propertyKey: 'key'};
      const locator2 = attribute(elementLocator, 'attr', StringParser, StringType);
      spyOn(locator2, 'setupVine');
      const rendererSpec2 = {locator: locator2, propertyKey: 'key'};

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of([rendererSpec1, rendererSpec2]),
          ImmutableSet.of(),
          mockVineBuilder);

      assert(mockVineBuilder.source).to.haveBeenCalledWith(locator1.getSourceId(), null);
      assert(mockVineBuilder.source).to.haveBeenCalledWith(locator2.getSourceId(), null);
      assert(locator1.setupVine).to.haveBeenCalledWith(mockVineBuilder);
      assert(locator2.setupVine).to.haveBeenCalledWith(mockVineBuilder);
    });

    should(`throw error if the tag is already registered`, () => {
      const tag = 'tag';
      const templateKey = 'templateKey';
      const vineBuilder = new VineBuilder();

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
          vineBuilder);

      assert(() => {
        builder.register(
            tag,
            templateKey,
            TestClass,
            ImmutableSet.of(),
            ImmutableSet.of(),
            vineBuilder);
      }).to.throwError(/unregistered/);
    });
  });
});
