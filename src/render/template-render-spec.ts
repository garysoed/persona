// import { merge, Observable, of as observableOf } from 'rxjs';

// import { Output } from '../types/output';
// import { ShadowRootLike } from '../types/shadow-root-like';

// import { RenderSpec } from './render-spec';
// import { PersonaContext } from '../core/persona-context';


// type ApplyValueFn = (root: ShadowRootLike) => Observable<unknown>;

// class TemplateRenderSpec implements RenderSpec {
//   constructor(
//       private readonly applyValueFns: Iterable<ApplyValueFn>,
//       private readonly templateEl: HTMLTemplateElement,
//   ) { }

//   canReuseElement(): boolean {
//     return false;
//   }

//   createElement(): Observable<Element> {
//     const fragment = document.importNode(this.templateEl.content, true);

//     if (fragment.childElementCount !== 1) {
//       throw new Error(`Template has ${fragment.childElementCount} elements, expected 1`);
//     }

//     const child = fragment.children.item(0);
//     if (!(child instanceof Element)) {
//       throw new Error('New element is not an HTML element');
//     }

//     return observableOf(child);
//   }

//   registerElement(element: Element): Observable<unknown> {
//     const upgradedEl: Element & ShadowRootLike = Object.defineProperties(
//         element,
//         {
//           getElementById: {
//             value: (id: string) => {
//               return element.querySelector(`#${id}`);
//             },
//           },
//           host: {
//             get: () => {
//               throw new Error('unsupported');
//             },
//           },
//         },
//     );

//     const appliedFns$List = [...this.applyValueFns].map(fn => fn(upgradedEl));
//     return merge(...appliedFns$List);
//   }
// }

// class TemplateRenderSpecBuilder {
//   private readonly applyValueFns: ApplyValueFn[] = [];

//   constructor(private readonly templateEl: HTMLTemplateElement) { }

//   addOutput<T>(output: Output<T>, value: T): this {
//     const fn: ApplyValueFn = context => observableOf(value)
//         .pipe(output.output(context));
//     this.applyValueFns.push(fn);

//     return this;
//   }

//   build(): TemplateRenderSpec {
//     return new TemplateRenderSpec(this.applyValueFns, this.templateEl);
//   }
// }

// export function renderFromTemplate(templateEl: HTMLTemplateElement): TemplateRenderSpecBuilder {
//   return new TemplateRenderSpecBuilder(templateEl);
// }
