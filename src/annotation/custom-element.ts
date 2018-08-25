import { VineApp } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { __class, Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ResolvedRenderableWatchableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { ComponentSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from '../main/component-spec';
import { PersonaBuilder } from '../main/persona-builder';

/**
 * Specs that define a custom element.
 */
interface Spec {
  dependencies?: (typeof BaseDisposable)[];
  shadowMode?: 'open'|'closed';
  tag: string;
  template: string;
  watch?: Iterable<ResolvedWatchableLocator<any>|ResolvedRenderableWatchableLocator<any>>;
}

export type CustomElement = (spec: Spec) => ClassDecorator;

export function customElementFactory(
    onDomAnnotationsCache: Annotations<OnDomSpec>,
    onKeydownAnnotationsCache: Annotations<OnKeydownSpec>,
    rendererAnnotationsCache: Annotations<RendererSpec>,
    customElementAnnotationsCache: Annotations<ComponentSpec>,
    personaBuilder: PersonaBuilder,
    vineApp: VineApp): CustomElement {
  return (spec: Spec) => {
    return (target: Function) => {
      const rendererSpecs = rendererAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce((prevSet, specs) => {
            return prevSet.addAll(specs);
          }, ImmutableSet.of<RendererSpec>());
      const keydownSpecs = onKeydownAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce((prevSet, specs) => {
            return prevSet.addAll(specs);
          }, ImmutableSet.of<OnKeydownSpec>());
      const listeners = onDomAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce((prevSet, specs) => {
            return prevSet.addAll(specs);
          }, ImmutableSet.of<OnDomSpec>());

      customElementAnnotationsCache.forCtor(target).attachValueToProperty(__class, {
        componentClass: target as any,
        keydownSpecs,
        listeners,
        renderers: rendererSpecs,
        tag: spec.tag,
        template: spec.template,
        watchers: ImmutableSet.of(spec.watch || []),
      });

      personaBuilder.register([target as any], vineApp);
    };
  };
}
