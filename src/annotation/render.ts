import { NodeId } from 'grapevine/export/component';
import { VineIn } from 'grapevine/src/annotation/vine-in';
import { Annotations } from 'gs-tools/export/data';
import { Output } from '../component/output';
import { RendererSpec } from '../main/component-spec';

interface RenderDecorator<T> extends PropertyDecorator {
  withForwarding(input: NodeId<T>): ClassDecorator;
}

export type Render = <T>(locator: Output<T>) => RenderDecorator<T>;

export function renderFactory(
    rendererAnnotationsCache: Annotations<RendererSpec>,
    vineIn: VineIn): Render {
  return <T>(locator: Output<T>) => {
    const decorator = (
        target: Object,
        propertyKey: string | symbol) => {
      let spec;

      spec = {output: locator, propertyKey, target};
      rendererAnnotationsCache.forCtor(target.constructor)
          .attachValueToProperty(propertyKey, spec);
    };

    const forwarding = {
      withForwarding(inputLocator: NodeId<T>): ClassDecorator {
        return (target: Function) => {
          const key = Symbol(`$forwarding: ${inputLocator} to ${locator}`);
          Object.defineProperty(target.prototype, key, {
            value: (v: T) => v,
          });
          decorator(target.prototype, key);

          vineIn(inputLocator)(target.prototype, key, 0);
        };
      },
    };

    // tslint:disable-next-line:prefer-object-spread
    return Object.assign(decorator, forwarding);
  };
}
