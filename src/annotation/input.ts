import { VineApp } from 'grapevine/export/main';
import { ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';

export type Input =
    (locator: ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>) =>
        ParameterDecorator;

export function inputFactory(vineApp: VineApp): Input {
  return (locator: ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>) => {
    return (
        target: Object,
        propertyKey: string | symbol,
        index: number) => {
      vineApp.vineIn(locator.getReadingId())(target, propertyKey, index);
    };
  };
}
