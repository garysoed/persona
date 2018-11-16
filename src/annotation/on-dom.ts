import { Annotations } from 'gs-tools/export/data';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { OnDomSpec } from '../main/component-spec';

export type OnDomAnnotation = (
    elementLocator: ResolvedWatchableLocator<Element>,
    eventName: string,
    options?: AddEventListenerOptions) => MethodDecorator;

export function onDomFactory(
    onDomAnnotationsCache: Annotations<OnDomSpec>): OnDomAnnotation {
  return (
      elementLocator: ResolvedWatchableLocator<Element>,
      eventName: string,
      options?: AddEventListenerOptions) => {
    return (target: Object, propertyKey: string | symbol) => {
      onDomAnnotationsCache.forCtor(target.constructor).attachValueToProperty(propertyKey, {
        elementLocator,
        eventName,
        options,
        propertyKey,
      });
    };
  };
}
