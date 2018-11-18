import { VineApp } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { BaseCustomElement, baseCustomElementFactory } from '../annotation/base-custom-element';
import { CustomElement, customElementFactory } from '../annotation/custom-element';
import { Input, inputFactory } from '../annotation/input';
import { OnDomAnnotation, onDomFactory } from '../annotation/on-dom';
import { OnKeydownAnnotation, onKeydownFactory } from '../annotation/on-keydown';
import { Render, renderFactory } from '../annotation/render';
import { BaseComponentSpec, ComponentSpec, InputSpec, OnDomSpec, OnKeydownSpec, RendererSpec } from './component-spec';
import { PersonaBuilder } from './persona-builder';

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  baseCustomElement: BaseCustomElement;
  builder: PersonaBuilder;
  customElement: CustomElement;
  input: Input;

  /**
   * Annotates method to listen to dom events.
   *
   * The method should take in two arguments:
   *
   * -   The event object.
   * -   The Vine object.
   */
  onDom: OnDomAnnotation;
  onKeydown: OnKeydownAnnotation;
  render: Render;
}

const apps = new Map<string, PersonaApp>();

/**
 * Gets or creates a new Persona app.
 * @param appName Name to register the app with
 * @param vineApp Object representing a Grapevine app.
 */
export function getOrRegisterApp(
    appName: string,
    vineApp: VineApp,
): PersonaApp {
  const createdApp = apps.get(appName);
  if (createdApp) {
    return createdApp;
  }

  const inputAnnotationsCache = new Annotations<InputSpec>(Symbol(`${appName}-input`));
  const onDomAnnotationsCache = new Annotations<OnDomSpec>(Symbol(`${appName}-onDom`));
  const onKeydownAnnotationsCache = new Annotations<OnKeydownSpec>(Symbol(`${appName}-onKeydown`));
  const renderAnnotationsCache = new Annotations<RendererSpec>(Symbol(`${appName}-render`));
  const customElementAnnotationsCache =
      new Annotations<ComponentSpec>(Symbol(`${appName}-component`));
  const baseCustomElementAnnotationsCache =
      new Annotations<BaseComponentSpec>(Symbol(`${appName}-baseComponent`));

  const baseCustomElement = baseCustomElementFactory(
      inputAnnotationsCache,
      onDomAnnotationsCache,
      onKeydownAnnotationsCache,
      renderAnnotationsCache,
      baseCustomElementAnnotationsCache,
  );

  const personaBuilder = new PersonaBuilder(
      baseCustomElementAnnotationsCache,
      customElementAnnotationsCache,
  );
  const input = inputFactory(inputAnnotationsCache, vineApp);
  const newApp = {
    baseCustomElement,
    builder: personaBuilder,
    customElement: customElementFactory(
        customElementAnnotationsCache,
        personaBuilder,
        vineApp,
        baseCustomElement,
    ),
    input,
    onDom: onDomFactory(onDomAnnotationsCache),
    onKeydown: onKeydownFactory(onKeydownAnnotationsCache),
    render: renderFactory(renderAnnotationsCache, input, vineApp.vineIn),
  };
  apps.set(appName, newApp);

  return newApp;
}
