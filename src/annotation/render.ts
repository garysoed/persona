import { NodeId } from 'grapevine/export/component';
import { ClassAnnotation, PropertyAnnotation } from 'gs-tools/export/data';
import { Output } from '../component/output';
import { OnCreateHandler } from '../main/component-spec';

interface RenderDecorator<T> extends PropertyDecorator {
  withForwarding(input: NodeId<T>): ClassDecorator;
}

export type Render = <T>(locator: Output<T>) => RenderDecorator<T>;

export function renderFactory(
    renderPropertyAnnotation: PropertyAnnotation<OnCreateHandler, [Output<unknown>]>,
    renderWithForwardingAnnotation:
        ClassAnnotation<OnCreateHandler, [Output<unknown>, NodeId<unknown>]>,
): Render {
  return <T>(output: Output<T>) => {
    const decorator = (
        target: Object,
        propertyKey: string | symbol,
    ) => renderPropertyAnnotation.getDecorator()(output)(target, propertyKey);

    const forwarding = {
      withForwarding(sourceId: NodeId<T>): ClassDecorator {
        return (target: Function) => {
            renderWithForwardingAnnotation.getDecorator()(output, sourceId)(target);
        };
      },
    };

    // tslint:disable-next-line:prefer-object-spread
    return Object.assign(decorator, forwarding);
  };
}
