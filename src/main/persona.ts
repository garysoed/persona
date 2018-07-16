import { VineApp } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { CustomElement, customElementFactory } from '../annotation/custom-element';
import { onDomFactory } from '../annotation/on-dom';
import { Render, renderFactory } from '../annotation/render';
import { OnDomSpec, RendererSpec } from './component-spec';
import { PersonaBuilder } from './persona-builder';

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  builder: PersonaBuilder;
  customElement: CustomElement;
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
    {builder: vineBuilder, vineOut}: VineApp): PersonaApp {
  const createdApp = apps.get(appName);
  if (createdApp) {
    return createdApp;
  }

  const onDomAnnotationsCache = new Annotations<OnDomSpec>(Symbol(`${appName}-onDom`));
  const renderAnnotationsCache = new Annotations<RendererSpec>(Symbol(`${appName}-render`));

  const personaBuilder = new PersonaBuilder();
  const newApp = {
    builder: personaBuilder,
    customElement: customElementFactory(
        personaBuilder,
        vineBuilder,
        onDomAnnotationsCache,
        renderAnnotationsCache),
    onDom: onDomFactory(onDomAnnotationsCache),
    render: renderFactory(vineOut, renderAnnotationsCache),
  };
  apps.set(appName, newApp);

  return newApp;
}
