import { assert, fshould, should } from 'gs-testing/export/main';
import { createSpyObject, fake, SpyObj } from 'gs-testing/export/spy';
import { ImmutableList } from 'gs-tools/export/collect';
import { __nodeId, ElementListRenderer } from './element-list-renderer';
import { __renderId } from './render-id';
import { Renderer } from './renderer';

interface Data {
  [__renderId]: string;
}

function createData(id: string): Data {
  return {[__renderId]: id};
}

function createElement(id: string): HTMLElement {
  return Object.assign(document.createElement('div'), {[__nodeId]: id, id});
}

describe('renderer.ElementListRenderer', () => {
  let renderer: ElementListRenderer<Data>;
  let mockRenderer: SpyObj<Renderer<Data, Element>>;

  beforeEach(() => {
    mockRenderer = createSpyObject<Renderer<Data, Element>>('Renderer', ['render']);
    renderer = new ElementListRenderer(mockRenderer);
  });

  describe('render', () => {
    fshould(`render correctly`, () => {
      const elementA = createElement('a');
      const elementB = createElement('b');
      const elementC = createElement('c');
      fake(mockRenderer.render).always().call(data => {
        switch (data[__renderId]) {
          case 'a':
            return elementA;
          case 'b':
            return elementB;
          case 'c':
            return elementC;
          default:
            throw new Error(`Unhandled renderId`);
        }
      });

      const docFragment = renderer.render(
          ImmutableList.of([createData('a'), createData('b'), createData('c')]),
          null);
      const childrenList = ImmutableList.of(docFragment.children);
      assert(childrenList).to.haveElements([elementA, elementB]);
      assert(childrenList.mapItem(child => (child as any)[__nodeId])).to
          .haveElements(['a', 'b', 'c']);
    });

    should(`render changes correctly`, () => {
      const element1 = createElement('1');
      const element2 = createElement('2');
      const element3 = createElement('3');
      const element4 = createElement('4');
      const element6 = createElement('6');
      const element7 = createElement('7');
      const element8 = createElement('8');
      fake(mockRenderer.render).always().call(data => {
        switch (data[__renderId]) {
          case '1':
            return element1;
          case '2':
            return element2;
          case '3':
            return element3;
          case '4':
            return element4;
          case '6':
            return element6;
          case '7':
            return element7;
          case '8':
            return element8;
          default:
            throw new Error(`Unhandled renderId`);
        }
      });

      const oldDocFragment = document.createDocumentFragment();
      oldDocFragment.appendChild(element1);
      oldDocFragment.appendChild(element2);
      oldDocFragment.appendChild(element6);
      oldDocFragment.appendChild(element7);
      oldDocFragment.appendChild(element8);

      const docFragment = renderer.render(
          ImmutableList.of([
            createData('2'),
            createData('3'),
            createData('4'),
            createData('6'),
            createData('7'),
          ]),
          oldDocFragment);
      const childrenList = ImmutableList.of(docFragment.children);
      assert(childrenList).to.haveElements([element2, element3, element4, element6, element7]);
      assert(childrenList.mapItem(child => (child as any)[__nodeId])).to
          .haveElements(['2', '3', '4', '6', '7']);
    });
  });
});
