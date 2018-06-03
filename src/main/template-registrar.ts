/**
 * Registers template strings to be used for Persona.
 */
export class TemplateRegistrar {
  private readonly templates_: Map<string, string> = new Map<string, string>();

  addTemplate(key: string, template: string): void {
    this.templates_.set(key, template);
  }

  getTemplate(key: string): string | null {
    return this.templates_.get(key) || null;
  }
}
