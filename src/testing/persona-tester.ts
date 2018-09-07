import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { CustomElementCtrl } from '../main/custom-element-ctrl';
import { PersonaBuilder } from '../main/persona-builder';
import { FakeCustomElementRegistry } from './fake-custom-element-registry';

class PersonaTester {
  constructor(
      readonly vine: VineImpl,
      private readonly customElementRegistry_: FakeCustomElementRegistry) { }

  createElement(tag: string, parent: HTMLElement): HTMLElement {
    return this.customElementRegistry_.create(tag, parent);
  }
}

export class PersonaTesterFactory {
  constructor(
      private readonly vineBuilder_: VineBuilder,
      private readonly personaBuilder_: PersonaBuilder) { }

  build(ctors: (typeof CustomElementCtrl)[]): PersonaTester {
    const customElementRegistry = new FakeCustomElementRegistry();
    const vine = this.vineBuilder_.run();
    this.personaBuilder_.build(ctors, customElementRegistry, vine);

    return new PersonaTester(vine, customElementRegistry);
  }
}
