export class TemplateService {
  private readonly templates = new Map<string, HTMLTemplateElement>();

  constructor(
      private readonly templateStr: ReadonlyMap<string, string>,
      private readonly rootDoc: Document,
  ) { }

  getTemplate(tag: string): HTMLTemplateElement {
    const template = this.templates.get(tag);
    if (template) {
      return template;
    }

    const templateStr = this.templateStr.get(tag);
    if (templateStr === undefined) {
      throw new Error(`No template found for ${tag}`);
    }

    const templateEl = this.rootDoc.createElement('template');
    templateEl.innerHTML = templateStr;
    this.templates.set(tag, templateEl);

    return templateEl;
  }
}
