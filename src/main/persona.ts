import { VineApp } from 'grapevine/export/main';
import { Annotations } from 'gs-tools/export/data';
import { CustomElement, customElementFactory } from '../annotation/custom-element';
import { Render, renderFactory } from '../annotation/render';
import { RendererSpec } from './component-spec';
import { PersonaBuilder } from './persona-builder';
import { TemplateRegistrar } from './template-registrar';

/**
 * Describes a Persona App.
 */
interface PersonaApp {
  builder: PersonaBuilder;
  customElement: CustomElement;
  render: Render;
  templates: TemplateRegistrar;
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

  const renderAnnotationsCache = new Annotations<RendererSpec>(Symbol(appName));
  const templates = new TemplateRegistrar();
  const personaBuilder = new PersonaBuilder(templates);
  const newApp = {
    builder: personaBuilder,
    customElement: customElementFactory(
        personaBuilder,
        vineBuilder,
        renderAnnotationsCache),
    render: renderFactory(
        vineOut,
        renderAnnotationsCache,
        vineBuilder),
    templates,
  };
  apps.set(appName, newApp);

  return newApp;
}
