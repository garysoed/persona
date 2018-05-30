import { assert, Match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { PersonaBuilder } from './persona-builder';

/**
 * @test
 */
class TestClass extends BaseDisposable { }

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
      const vine = Mocks.object('vine');

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
          ImmutableSet.of());
      builder.build(mockCustomElementRegistry, vine);

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, Match.anyThing());
    });

    should(`throw error if the tag is already registered`, () => {
      const tag = 'tag';
      const templateKey = 'templateKey';

      builder.register(
          tag,
          templateKey,
          TestClass,
          ImmutableSet.of(),
          ImmutableSet.of(),
          ImmutableSet.of());

      assert(() => {
        builder.register(
            tag,
            templateKey,
            TestClass,
            ImmutableSet.of(),
            ImmutableSet.of(),
            ImmutableSet.of());
      }).to.throwError(/unregistered/);
    });
  });
});
