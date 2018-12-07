import { VineApp } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { ResolvedWatchableLocator } from '../locator/resolved-locator';
import { InputSpec } from '../main/component-spec';

export type Input = (locator: ResolvedWatchableLocator<any>) => ParameterDecorator;

export function inputFactory(
    inputAnnotationsCache: Annotations<InputSpec>,
    vineApp: VineApp,
): Input {
  return (locator: ResolvedWatchableLocator<any>) => {
    return (
        target: Object,
        propertyKey: string | symbol,
        index: number) => {
      inputAnnotationsCache.forCtor(target.constructor)
          .attachValueToProperty(propertyKey, locator);
      vineApp.vineIn(locator.getReadingId())(target, propertyKey, index);
    };
  };
}
