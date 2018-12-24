import { NodeId } from 'grapevine/export/component';
import { VineIn } from 'grapevine/src/annotation/vine-in';
import { Annotations } from 'gs-tools/export/data';
import { Output } from '../component/output';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { RendererSpec } from '../main/component-spec';
import { Input } from './input';

type ForwardingInput<T> = ResolvedWatchableLocator<T>|NodeId<T>;
type RenderInput<T> = ResolvedRenderableLocator<T>|Output<T>;

interface RenderDecorator<T> extends PropertyDecorator {
  withForwarding(input: ForwardingInput<T>): ClassDecorator;
}

export type Render = <T>(locator: RenderInput<T>) => RenderDecorator<T>;

export function renderFactory(
    rendererAnnotationsCache: Annotations<RendererSpec>,
    input: Input,
    vineIn: VineIn): Render {
  return <T>(locator: RenderInput<T>) => {
    const decorator = (
        target: Object,
        propertyKey: string | symbol) => {
      let spec;

      if (locator instanceof ResolvedRenderableLocator) {
        spec = {locator, propertyKey, target};
      } else {
        spec = {output: locator, propertyKey, target};
      }
      rendererAnnotationsCache.forCtor(target.constructor)
          .attachValueToProperty(propertyKey, spec);
    };

    const forwarding = {
      withForwarding(inputLocator: ForwardingInput<T>): ClassDecorator {
        return (target: Function) => {
          const key = Symbol(`$forwarding: ${inputLocator} to ${locator}`);
          Object.defineProperty(target.prototype, key, {
            value: (v: T) => v,
          });
          decorator(target.prototype, key);

          if (inputLocator instanceof NodeId) {
            vineIn(inputLocator)(target.prototype, key, 0);
          } else {
            input(inputLocator)(target.prototype, key, 0);
          }
        };
      },
    };

    // tslint:disable-next-line:prefer-object-spread
    return Object.assign(decorator, forwarding);
  };
}
