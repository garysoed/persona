import { Annotations } from 'gs-tools/export/data';
import { ResolvedRenderableLocator } from '../locator/resolved-locator';
import { RendererSpec } from '../main/component-spec';

export type Render = (locator: ResolvedRenderableLocator<any>) => MethodDecorator;

export function renderFactory(
    rendererAnnotationsCache: Annotations<RendererSpec>): Render {
  return (locator: ResolvedRenderableLocator<any>) => {
    return <T>(
        target: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>) => {
      rendererAnnotationsCache.forCtor(target.constructor)
          .attachValueToProperty(propertyKey, {descriptor, locator, propertyKey, target});
    };
  };
}
