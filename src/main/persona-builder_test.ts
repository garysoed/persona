import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineApp, VineBuilder, VineImpl } from 'grapevine/export/main';
import { InstanceSourceProvider } from 'grapevine/src/node/instance-source-provider';
import { assert, match, should, test } from 'gs-testing/export/main';
import { mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, createSpyObject, fake, Spy, SpyObj } from 'gs-testing/export/spy';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { InstanceofType } from 'gs-types/export';
import { ResolvedWatchableLocator } from 'src/locator/resolved-locator';
import { classlist } from '../locator/classlist-locator';
import { element } from '../locator/element-locator';
import { BaseComponentSpec, ComponentSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from './component-spec';
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
      const vineBuilder = new VineBuilder();
      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        tag,
        template,
      };

      const baseComponentSpec: BaseComponentSpec = {
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);
      baseCustomElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, baseComponentSpec);

      builder.register([TestClass], {builder: vineBuilder, vineOut: createSpy('VineOut')} as any);
      builder.build([tag], mockCustomElementRegistry, vineBuilder.run());

      assert(mockCustomElementRegistry.define).to.haveBeenCalledWith(tag, match.anyThing());
    });

    should(`register the watchers correctly`, async () => {
      const tag = 'tag';
      const template = 'template';
      const mockVineBuilder = createSpyInstance(VineBuilder);
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
        tag,
        template,
      };

      const baseComponentSpec: BaseComponentSpec = {
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        watchers: ImmutableSet.of([locator1, locator2]),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);
      baseCustomElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, baseComponentSpec);

      builder.register(
          [TestClass],
          {builder: mockVineBuilder, vineOut: createSpy('vineOut')} as any);

      const providerMatcher = match.anyThat<InstanceSourceProvider<HTMLElement|null>>()
          .beAFunction();

      const sourceWithProvider =
          mockVineBuilder.sourceWithProvider as any as Spy<SourceWithProvider<HTMLElement|null>>;
      assert(sourceWithProvider).to
          .haveBeenCalledWith(locator1.getReadingId(), providerMatcher);
      assert(await providerMatcher.getLastMatch()(context)).to.equal(sectionEl);
      assert(sourceWithProvider)
          .to.haveBeenCalledWith(locator2.getReadingId(), providerMatcher);
      assert(await providerMatcher.getLastMatch()(context)).to.equal(anchorEl);
    });

    should(`register the renderers correctly`, async () => {
      const tag = 'tag';
      const template = 'template';
      const mockVineBuilder = createSpyInstance(VineBuilder);
      const locator1 = classlist(element('section', InstanceofType(HTMLElement)));
      const locator2 = classlist(element('a', InstanceofType(HTMLElement)));

      const descriptor1 = mocks.object('descriptor1');
      const propertyKey1 = 'propertyKey1';
      const target1 = mocks.object('target1');
      const renderer1 = {
        descriptor: descriptor1,
        locator: locator1,
        propertyKey: propertyKey1,
        target: target1,
      };
      /** @TODO Make this easier. */
      const mockDecorator1 = createSpy<void, [Object, string|symbol]>('decorator1');

      const descriptor2 = mocks.object('descriptor2');
      const propertyKey2 = 'propertyKey2';
      const target2 = mocks.object('target2');
      const renderer2 = {
        descriptor: descriptor2,
        locator: locator2,
        propertyKey: propertyKey2,
        target: target2,
      };
      const mockDecorator2 = createSpy<void, [Object, string|symbol]>('decorator2');

      const mockVineOut = createSpy<MethodDecorator, [InstanceStreamId<unknown>]>('vineOut');
      fake(mockVineOut)
          .when(locator1.getWritingId()).return(mockDecorator1)
          .when(locator2.getWritingId()).return(mockDecorator2);

      const anchorEl = document.createElement('a');
      const sectionEl = document.createElement('section');
      const rootEl = document.createElement('div');
      rootEl.appendChild(anchorEl);
      rootEl.appendChild(sectionEl);

      const context = new TestClass();
      (context as any)[SHADOW_ROOT] = rootEl;


      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        tag,
        template,
      };

      const baseComponentSpec: BaseComponentSpec = {
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of([renderer1, renderer2]),
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);
      baseCustomElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, baseComponentSpec);

      builder.register(
          [TestClass],
          {builder: mockVineBuilder, vineOut: mockVineOut} as any);

      assert(mockDecorator1).to.haveBeenCalledWith(target1, propertyKey1);
      assert(mockDecorator2).to.haveBeenCalledWith(target2, propertyKey2);
    });

    should(`throw error if the tag is already registered`, () => {
      const tag = 'tag';
      const template = 'template';
      const vineBuilder = new VineBuilder();

      const componentSpec: ComponentSpec = {
        componentClass: TestClass,
        tag,
        template,
      };

      const baseComponentSpec: BaseComponentSpec = {
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        watchers: ImmutableSet.of(),
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
      const vineBuilder = new VineBuilder();

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

      const keydownSpec1 = mocks.object<OnKeydownSpec>('keydownSpec1');
      const keydownSpec2 = mocks.object<OnKeydownSpec>('keydownSpec2');
      const keydownSpec3 = mocks.object<OnKeydownSpec>('keydownSpec3');

      const onDomSpec1 = mocks.object<OnDomSpec>('onDomSpec1');
      const onDomSpec2 = mocks.object<OnDomSpec>('onDomSpec2');
      const onDomSpec3 = mocks.object<OnDomSpec>('onDomSpec3');

      const rendererSpec1 = mocks.object<RendererSpec>('rendererSpec1');
      const rendererSpec2 = mocks.object<RendererSpec>('rendererSpec2');
      const rendererSpec3 = mocks.object<RendererSpec>('rendererSpec3');

      const watcher1 = mocks.object<ResolvedWatchableLocator<any>>('watcher1');
      const watcher2 = mocks.object<ResolvedWatchableLocator<any>>('watcher2');
      const watcher3 = mocks.object<ResolvedWatchableLocator<any>>('watcher3');

      cache.forCtor(ParentTestClass).attachValueToProperty(
          __class,
          {
            keydownSpecs: [keydownSpec1],
            listeners: [onDomSpec1, onDomSpec2],
            renderers: [rendererSpec1],
            watchers: [watcher1, watcher2],
          },
      );
      cache.forCtor(TestClass).attachValueToProperty(
          __class,
          {
            keydownSpecs: [keydownSpec2, keydownSpec3],
            listeners: [onDomSpec3],
            renderers: [rendererSpec2, rendererSpec3],
            watchers: [watcher2, watcher3],
          },
      );

      const spec = getSpec_(cache, TestClass);
      // tslint:disable-next-line:no-non-null-assertion
      assert(spec.keydownSpecs!).to.haveElements([keydownSpec1, keydownSpec2, keydownSpec3]);
      // tslint:disable-next-line:no-non-null-assertion
      assert(spec.listeners!).to.haveElements([onDomSpec1, onDomSpec2, onDomSpec3]);
      // tslint:disable-next-line:no-non-null-assertion
      assert(spec.renderers!).to.haveElements([rendererSpec1, rendererSpec2, rendererSpec3]);
      // tslint:disable-next-line:no-non-null-assertion
      assert(spec.watchers!).to.haveElements([watcher1, watcher2, watcher3]);
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
