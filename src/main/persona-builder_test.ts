import { InstanceSourceId, InstanceStreamId } from 'grapevine/export/component';
import { VineApp, VineBuilder } from 'grapevine/export/main';
import { InstanceSourceProvider } from 'grapevine/src/node/instance-source-provider';
import { assert, match, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance, createSpyObject, fake, Spy, SpyObj } from 'gs-testing/export/spy';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { InstanceofType } from 'gs-types/export';
import { classlist } from '../locator/classlist-locator';
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

type SourceWithProvider<T> = (id: InstanceSourceId<T>, provider: InstanceSourceProvider<T>) => void;

describe('main.PersonaBuilder', () => {
  let customElementsAnnotationsCache: Annotations<ComponentSpec>;
  let builder: PersonaBuilder;

  beforeEach(() => {
    customElementsAnnotationsCache = Annotations.of<ComponentSpec>(Symbol('test'));
    builder = new PersonaBuilder(customElementsAnnotationsCache);
  });

  describe('register', () => {
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
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        tag,
        template,
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

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
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        tag,
        template,
        watchers: ImmutableSet.of([locator1, locator2]),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

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

      const descriptor1 = Mocks.object('descriptor1');
      const propertyKey1 = 'propertyKey1';
      const target1 = Mocks.object('target1');
      const renderer1 = {
        descriptor: descriptor1,
        locator: locator1,
        propertyKey: propertyKey1,
        target: target1,
      };
      // TODO: Make this easier.
      const mockDecorator1 = createSpy<void, [Object, string|symbol]>('decorator1');

      const descriptor2 = Mocks.object('descriptor2');
      const propertyKey2 = 'propertyKey2';
      const target2 = Mocks.object('target2');
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
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of([renderer1, renderer2]),
        tag,
        template,
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

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
        keydownSpecs: ImmutableSet.of(),
        listeners: ImmutableSet.of(),
        renderers: ImmutableSet.of(),
        tag,
        template,
        watchers: ImmutableSet.of(),
      };

      customElementsAnnotationsCache.forCtor(TestClass)
          .attachValueToProperty(__class, componentSpec);

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
});
