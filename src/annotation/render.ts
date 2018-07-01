import { VineOut } from 'grapevine/export/annotation';
import { VineBuilder } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { ResolvedRenderableLocator } from '../locator/resolved-locator';
import { RendererSpec } from '../main/component-spec';

export type Render = (locator: ResolvedRenderableLocator<any>) => MethodDecorator;

export function renderFactory(
    vineOut: VineOut,
    rendererAnnotationsCache: Annotations<RendererSpec>,
    vineBuilder: VineBuilder): Render {
  return (locator: ResolvedRenderableLocator<any>) => {
    return <T>(
        target: Object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>) => {
      vineOut(locator.getWritingId())(target, propertyKey, descriptor);
      rendererAnnotationsCache.forCtor(target.constructor)
          .attachValueToProperty(propertyKey, {locator, propertyKey});
    };
  };
}
