import { Annotations } from 'gs-tools/export/data';
import { ResolvedRenderableLocator, ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { RendererSpec } from '../main/component-spec';
import { Input } from './input';

interface RenderDecorator<T> extends PropertyDecorator {
  withForwarding(
      input: ResolvedWatchableLocator<T>|ResolvedRenderableWatchableLocator<T>): ClassDecorator;
}

export type Render =
    <T>(locator: ResolvedRenderableLocator<T>) => RenderDecorator<T>;

export function renderFactory(
    rendererAnnotationsCache: Annotations<RendererSpec>,
    input: Input): Render {
  return <T>(locator: ResolvedRenderableLocator<T>|ResolvedRenderableWatchableLocator<T>) => {
    const decorator = (
        target: Object,
        propertyKey: string | symbol) => {
      rendererAnnotationsCache.forCtor(target.constructor)
          .attachValueToProperty(propertyKey, {locator, propertyKey, target});
    };

    const forwarding = {
      withForwarding(inputLocator: ResolvedWatchableLocator<T>): ClassDecorator {
        return (target: Function) => {
          const key = Symbol(`$forwarding: ${inputLocator} to ${locator}`);
          Object.defineProperty(target.prototype, key, {
            value: (v: T) => v,
          });
          decorator(target.prototype, key);
          input(inputLocator)(target.prototype, key, 0);
        };
      },
    };

    // tslint:disable-next-line:prefer-object-spread
    return Object.assign(decorator, forwarding);
  };
}
