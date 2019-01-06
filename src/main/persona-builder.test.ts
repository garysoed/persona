import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineApp, VineBuilder, VineImpl } from 'grapevine/export/main';
import { InstanceSourceProvider } from 'grapevine/src/node/instance-source-provider';
import { assert, match, should, test } from 'gs-testing/export/main';
import { mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, createSpyObject, fake, Spy, SpyObj } from 'gs-testing/export/spy';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { InstanceofType } from 'gs-types/export';
import { BaseComponentSpec, ComponentSpec, RendererSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { SHADOW_ROOT } from './custom-element-impl';
import { getSpec_, PersonaBuilder } from './persona-builder';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(): void {
    // noop
  }
}

type SourceWithProvider<T> = (id: InstanceSourceId<T>, provider: InstanceSourceProvider<T>) => void;

test('main.PersonaBuilder', () => {
  let baseCustomElementsAnnotationsCache: Annotations<BaseComponentSpec>;
  let customElementsAnnotationsCache: Annotations<ComponentSpec>;
  let builder: PersonaBuilder;

  beforeEach(() => {
    baseCustomElementsAnnotationsCache =
        Annotations.of<BaseComponentSpec>(Symbol('testBaseComponentSpec'));
    customElementsAnnotationsCache = Annotations.of<ComponentSpec>(Symbol('testComponentSpec'));
    builder = new PersonaBuilder(
        baseCustomElementsAnnotationsCache,
        customElementsAnnotationsCache,
    );
  });

  test('register', () => {
    let mockVine: VineApp;

    beforeEach(() => {
      const mockVineBuilder = createSpyInstance(VineBuilder);
      const mockVineOut = createSpy<MethodDecorator, [InstanceStreamId<unknown>]>('VineOut');
      mockVine = {builder: mockVineBuilder, vineOut: mockVineOut} as any;
    });

    should(`register the components correctly`, () => {
      const tag = 'tag';
      const template = 'template';
      const mockCustomElementRegistry =
          createSpyObject<CustomElementRegistry>('CustomElementRegistry', ['define']);
      const vineBuilder = new VineBuilder(Annotations.of(Symbol('test')));
      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        tag,
        template,
      };

      const baseComponentSpec: BaseComponentSpec = {
        renderers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);
      baseCustomElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, baseComponentSpec);

      builder.register([TestClass], {builder: vineBuilder, vineOut: createSpy('VineOut')} as any);
      builder.build([tag], mockCustomElementRegistry, vineBuilder.run());

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, match.anyThing());
    });

    should(`throw error if the tag is already registered`, () => {
      const tag = 'tag';
      const template = 'template';
      const vineBuilder = new VineBuilder(Annotations.of(Symbol('test')));

      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        tag,
        template,
      };

      const baseComponentSpec: BaseComponentSpec = {
        renderers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);
      baseCustomElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, baseComponentSpec);

      const vineApp: any = {builder: vineBuilder, vineOut: createSpy('VineOut')};

      builder.register([TestClass], vineApp);

      assert(() => {
        builder.register([TestClass], vineApp);
      }).to.throwErrorWithMessage(/unregistered/);
    });

    should(`throw error if annotations does not exist`, () => {
      const vineBuilder = new VineBuilder(Annotations.of(Symbol('test')));

      assert(() => {
        builder.register([TestClass], {builder: vineBuilder, vineOut: createSpy('VineOut')} as any);
      }).to.throwErrorWithMessage(/Annotations for/);
    });
  });

  test('getSpec_', () => {
    class ParentTestClass extends CustomElementCtrl {
      init(vine: VineImpl): void {
        throw new Error('Method not implemented.');
      }
    }

    class TestClass extends ParentTestClass { }

    should(`combine the specs correctly for BaseComponentSpec`, () => {
      const cache = Annotations.of<BaseComponentSpec>(Symbol('baseComponentSpec'));

      const rendererSpec1 = mocks.object<RendererSpec>('rendererSpec1');
      const rendererSpec2 = mocks.object<RendererSpec>('rendererSpec2');
      const rendererSpec3 = mocks.object<RendererSpec>('rendererSpec3');

      cache.forCtor(ParentTestClass).attachValueToProperty(
          __class,
          {
            renderers: [rendererSpec1],
          },
      );
      cache.forCtor(TestClass).attachValueToProperty(
          __class,
          {
            renderers: [rendererSpec2, rendererSpec3],
          },
      );

      const spec = getSpec_(cache, TestClass);
      // tslint:disable-next-line:no-non-null-assertion
      assert(spec.renderers!).to.haveElements([rendererSpec1, rendererSpec2, rendererSpec3]);
    });

    should(`combine the specs correctly for ComponentSpec`, () => {
      const cache = Annotations.of<ComponentSpec>(Symbol('componentSpec'));

      const tag1 = 'tag1';
      const tag2 = 'tag2';
      const template1 = 'template1';
      const template2 = 'template2';

      cache.forCtor(ParentTestClass).attachValueToProperty(
          __class,
          {
            componentClass: ParentTestClass,
            tag: tag1,
            template: template1,
          },
      );
      cache.forCtor(TestClass).attachValueToProperty(
          __class,
          {
            componentClass: TestClass,
            tag: tag2,
            template: template2,
          },
      );

      const spec = getSpec_(cache, TestClass);
      assert(spec.componentClass).to.equal(TestClass);
      assert(spec.tag).to.equal(tag2);
      assert(spec.template).to.equal(template2);
    });

    should(`throw error if there are no annotations`, () => {
      const cache = Annotations.of<ComponentSpec>(Symbol('componentSpec'));

      assert(() => {
        getSpec_(cache, TestClass);
      }).to.throwErrorWithMessage(/should exist/);
    });
  });
});
