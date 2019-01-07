import { InstanceStreamId } from 'grapevine/export/component';
import { VineApp, VineBuilder, VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
import { mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, createSpyObject, fake, Spy, SpyObj } from 'gs-testing/export/spy';
import { ImmutableList, ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations, ClassAnnotation } from 'gs-tools/export/data';
import { Spec } from '../annotation/base-custom-element';
import { BaseComponentSpec, ComponentSpec, RendererSpec } from './component-spec';
import { CustomElementCtrl } from './custom-element-ctrl';
import { FullComponentSpec, getSpec_, PersonaBuilder } from './persona-builder';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(): void {
    // noop
  }
}

test('main.PersonaBuilder', () => {
  let baseCustomElementsAnnotationsCache: Annotations<BaseComponentSpec>;
  let mockBaseCustomElement: Spy<ClassDecorator, [Spec]>;
  let mockComponentSpecAnnotation: SpyObj<ClassAnnotation<FullComponentSpec, [any]>>;
  let builder: PersonaBuilder;

  beforeEach(() => {
    mockBaseCustomElement = createSpy('baseCustomElement');
    baseCustomElementsAnnotationsCache =
        Annotations.of<BaseComponentSpec>(Symbol('testBaseComponentSpec'));
    mockComponentSpecAnnotation = createSpyInstance(ClassAnnotation);
    builder = new PersonaBuilder(
        baseCustomElementsAnnotationsCache,
        mockBaseCustomElement,
        mockComponentSpecAnnotation,
    );
  });

  test('register', () => {
    beforeEach(() => {
      fake(mockBaseCustomElement).always().return(() => undefined);
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

      fake(mockComponentSpecAnnotation.getAttachedValues)
          .when(TestClass)
          .return(
              ImmutableList.of([
                [TestClass, componentSpec] as [Function, ComponentSpec],
              ]));
      baseCustomElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, baseComponentSpec);

      builder.build([TestClass], mockCustomElementRegistry, vineBuilder);

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, match.anyThing());
    });

    should(`throw error if annotations does not exist`, () => {
      const mockCustomElementRegistry =
          createSpyObject<CustomElementRegistry>('CustomElementRegistry', ['define']);
      const vineBuilder = new VineBuilder(Annotations.of(Symbol('test')));

      fake(mockComponentSpecAnnotation.getAttachedValues)
          .when(TestClass)
          .return(ImmutableList.of([]));

      assert(() => {
        builder.build(
            [TestClass],
            mockCustomElementRegistry,
            {builder: vineBuilder, vineOut: createSpy('VineOut')} as any,
        );
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
      const rendererSpec1 = mocks.object<RendererSpec>('rendererSpec1');
      const rendererSpec2 = mocks.object<RendererSpec>('rendererSpec2');
      const rendererSpec3 = mocks.object<RendererSpec>('rendererSpec3');

      const spec = getSpec_(
          ImmutableList.of([
            {renderers: [rendererSpec2, rendererSpec3]},
            {renderers: [rendererSpec1]},
          ]),
          TestClass,
      );
      // tslint:disable-next-line:no-non-null-assertion
      assert(spec.renderers!).to.haveElements([rendererSpec1, rendererSpec2, rendererSpec3]);
    });

    should(`combine the specs correctly for ComponentSpec`, () => {
      const tag1 = 'tag1';
      const tag2 = 'tag2';
      const template1 = 'template1';
      const template2 = 'template2';

      const spec = getSpec_(
          ImmutableList.of([
            {
              componentClass: TestClass,
              tag: tag2,
              template: template2,
            },
            {
              componentClass: ParentTestClass,
              tag: tag1,
              template: template1,
            },
          ]),
          TestClass,
      );
      assert(spec.componentClass).to.equal(TestClass);
      assert(spec.tag).to.equal(tag2);
      assert(spec.template).to.equal(template2);
    });

    should(`throw error if there are no annotations`, () => {
      assert(() => {
        getSpec_(ImmutableList.of(), TestClass);
      }).to.throwErrorWithMessage(/should exist/);
    });
  });
});
