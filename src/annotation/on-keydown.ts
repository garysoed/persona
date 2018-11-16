import { Annotations } from 'gs-tools/export/data';
import { MatchOptions } from '../event/keydown-listener';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { OnKeydownSpec } from '../main/component-spec';

export type OnKeydownAnnotation = (
    elementLocator: ResolvedWatchableLocator<Element>,
    key: string,
    matchOption?: MatchOptions,
    options?: AddEventListenerOptions) => MethodDecorator;

export function onKeydownFactory(
    onKeydownAnnotationsCache: Annotations<OnKeydownSpec>): OnKeydownAnnotation {
  return (
      elementLocator: ResolvedWatchableLocator<Element>,
      key: string,
      matchOptions?: MatchOptions,
      options?: AddEventListenerOptions) => {
    return (
        target: Object,
        propertyKey: string | symbol) => {
      onKeydownAnnotationsCache.forCtor(target.constructor).attachValueToProperty(propertyKey, {
        elementLocator,
        key,
        matchOptions,
        options,
        propertyKey,
      });
    };
  };
}
