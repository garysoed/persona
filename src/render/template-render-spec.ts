import { combineLatest, Observable, of as observableOf } from '@rxjs';
import { take } from '@rxjs/operators';

import { Output } from '../types/output';
import { ShadowRootLike } from '../types/shadow-root-like';

import { RenderSpec } from './render-spec';

type ApplyValueFn = (root: ShadowRootLike) => Observable<unknown>;

class TemplateRenderSpec implements RenderSpec {
  constructor(
      private readonly applyValueFns: Iterable<ApplyValueFn>,
      private readonly templateEl: HTMLTemplateElement,
  ) { }

  canReuseElement(): boolean {
    return false;
  }

  createElement(): HTMLElement {
    const fragment = document.importNode(this.templateEl.content, true);

    if (fragment.childElementCount !== 1) {
      throw new Error(`Template has ${fragment.childElementCount} elements, expected 1`);
    }

    const child = fragment.children.item(0);
    if (!(child instanceof HTMLElement)) {
      throw new Error('New element is not an HTML element');
    }

    return child;
  }

  updateElement(element: HTMLElement): void {
    const upgradedEl: HTMLElement & ShadowRootLike = Object.defineProperties(
        element,
        {
          getElementById: {
            value: (id: string) => {
              return element.querySelector(`#${id}`);
            },
          },
          host: {
            get: () => {
              throw new Error('unsupported');
            },
          },
        },
    );

    const appliedFns$List = [...this.applyValueFns].map(fn => fn(upgradedEl));
    // TODO: Come up with a better interface.
    combineLatest(appliedFns$List).pipe(take(1)).subscribe();
  }
}

class TemplateRenderSpecBuilder {
  private readonly applyValueFns: ApplyValueFn[] = [];

  constructor(private readonly templateEl: HTMLTemplateElement) { }

  addOutput<T>(output: Output<T>, value: T): this {
    const fn: ApplyValueFn = (root: ShadowRootLike) => output.output(root, observableOf(value));
    this.applyValueFns.push(fn);

    return this;
  }

  build(): TemplateRenderSpec {
    return new TemplateRenderSpec(this.applyValueFns, this.templateEl);
  }
}

export function renderFromTemplate(templateEl: HTMLTemplateElement): TemplateRenderSpecBuilder {
  return new TemplateRenderSpecBuilder(templateEl);
}
