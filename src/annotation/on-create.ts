import { Annotations } from 'gs-tools/export/data';
import { OnCreateSpec } from '../main/component-spec';

export type OnCreateAnnotation = () => PropertyDecorator;

export function onCreateFactory(
    onCreateAnnotationsCache: Annotations<OnCreateSpec>,
): OnCreateAnnotation {
  return () => {
    return (target: Object, propertyKey: string|symbol) => {
      onCreateAnnotationsCache.forCtor(target.constructor).attachValueToProperty(
          propertyKey,
          {propertyKey, target},
      );
    };
  };
}
