import { VineBuilder } from 'grapevine/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { Annotations } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ResolvedLocator } from '../locator/locator';
import { RendererSpec } from '../main/component-spec';
import { PersonaBuilder } from '../main/persona-builder';

/**
 * Specs that define a custom element.
 */
interface Spec {
  shadowMode?: 'open'|'closed';
  tag: string;
  templateKey: string;
  watch?: Iterable<ResolvedLocator<any>>;
}

export type CustomElement = (spec: Spec) => ClassDecorator;

export function customElementFactory(
    personaBuilder: PersonaBuilder,
    vineBuilder: VineBuilder,
    rendererAnnotationsCache: Annotations<RendererSpec>): CustomElement {
  return (spec: Spec) => {
    return (target: Function) => {
      const rendererSpecs = rendererAnnotationsCache
          .forCtor(target)
          .getAttachedValues()
          .reduce((prevSet, specs) => {
            return prevSet.addAll(specs);
          }, ImmutableSet.of<RendererSpec>());

      personaBuilder.register(
          spec.tag,
          spec.templateKey,
          target as (typeof BaseDisposable),
          rendererSpecs,
          ImmutableSet.of(spec.watch || []),
          vineBuilder,
          spec.shadowMode);
    };
  };
}
