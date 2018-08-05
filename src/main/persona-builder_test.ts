import { VineBuilder } from 'grapevine/export/main';
import { InstanceSourceProvider } from 'grapevine/src/node/instance-source-provider';
import { assert, match, should } from 'gs-testing/export/main';
import { createSpyInstance, createSpyObject } from 'gs-testing/export/spy';
import { ImmutableSet } from 'gs-tools/export/collect';
import { InstanceofType } from 'gs-types/export';
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
      const mockCustomElementRegistry =
          createSpyObject<CustomElementRegistry>('CustomElementRegistry', ['define']);
      const vineBuilder = new VineBuilder();

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
          ImmutableSet.of(),
          ImmutableSet.of(),
          vineBuilder);
      builder.build(mockCustomElementRegistry, vineBuilder.run(), []);

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, match.anyThing());
    });

    should(`register the watchers correctly`, async () => {
      const tag = 'tag';
      const templateKey = 'templateKey';
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

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
          ImmutableSet.of(),
          ImmutableSet.of([locator1, locator2]),
          mockVineBuilder);

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
      const templateKey = 'templateKey';
      const vineBuilder = new VineBuilder();

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
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
            ImmutableSet.of(),
            ImmutableSet.of(),
            vineBuilder);
      }).to.throwErrorWithMessage(/unregistered/);
    });
  });
});
