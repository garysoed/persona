import { assert, should, test } from 'gs-testing/export/main';
import { ImmutableList, ImmutableMap } from 'gs-tools/export/collect';
import { __nodeId, ElementListRenderer, ElementWithId } from './element-list-renderer';
import { __renderId } from './render-id';
import { Renderer } from './renderer';

interface Data {
  [__renderId]: string;
}

function createData(id: string): Data {
  return {[__renderId]: id};
}

function createElement(id: string): ElementWithId {
  return Object.assign(document.createElement('div'), {[__nodeId]: id, id});
}

class TestRenderer implements Renderer<Data, Element> {
  idMap: ImmutableMap<string, Element> = ImmutableMap.of();

  render(
      currentValue: Data,
      _existingRender: Element|null,
      parentNode: Node,
      insertionPoint: Node|null): Element {
    const renderId = currentValue[__renderId];
    const el = this.idMap.get(renderId);
    if (!el) {
      throw new Error(`Unhandled renderId ${renderId}`);
    }

    if (insertionPoint) {
      parentNode.insertBefore(el, insertionPoint.nextSibling);
    } else {
      parentNode.insertBefore(el, null);
    }

    return el;
  }
}

test('renderer.ElementListRenderer', () => {
  let renderer: ElementListRenderer<Data>;
  let testRenderer: TestRenderer;

  beforeEach(() => {
    testRenderer = new TestRenderer();
    renderer = new ElementListRenderer(testRenderer);
  });

  test('render', () => {
    should(`render correctly`, () => {
      const elementA = createElement('a');
      const elementB = createElement('b');
      const elementC = createElement('c');
      testRenderer.idMap = ImmutableMap.of([
        ['a', elementA],
        ['b', elementB],
        ['c', elementC],
      ]);

      const root = document.createElement('div');
      const insertionPoint = document.createComment('start');
      root.appendChild(insertionPoint);

      const childrenList = renderer.render(
          ImmutableList.of([createData('a'), createData('b'), createData('c')]),
          null,
          root,
          insertionPoint);
      assert(childrenList.mapItem(child => (child as Element)))
          .to.haveElements([elementA, elementB, elementC]);
      assert(childrenList.mapItem(child => (child as any)[__nodeId])).to
          .haveElements(['a', 'b', 'c']);
      assert(ImmutableList.of<Node>(root.childNodes)).to.haveElements([
        insertionPoint,
        elementA,
        elementB,
        elementC,
      ]);
    });

    should(`render changes correctly`, () => {
      const element1 = createElement('1');
      const element2 = createElement('2');
      const element3 = createElement('3');
      const element4 = createElement('4');
      const element6 = createElement('6');
      const element7 = createElement('7');
      const element8 = createElement('8');
      testRenderer.idMap = ImmutableMap.of([
        ['1', element1],
        ['2', element2],
        ['3', element3],
        ['4', element4],
        ['6', element6],
        ['7', element7],
        ['8', element8],
      ]);

      const previousRender = ImmutableList.of([
        element1,
        element2,
        element6,
        element7,
        element8,
      ]);

      const root = document.createElement('div');
      const insertionPoint = document.createComment('start');
      root.appendChild(insertionPoint);

      const childrenList = renderer.render(
          ImmutableList.of([
            createData('2'),
            createData('3'),
            createData('4'),
            createData('6'),
            createData('7'),
          ]),
          previousRender,
          root,
          insertionPoint);
      assert(childrenList).to.haveElements([element2, element3, element4, element6, element7]);
      assert(childrenList.mapItem(child => (child as any)[__nodeId])).to
          .haveElements(['2', '3', '4', '6', '7']);
      assert(ImmutableList.of(root.childNodes)).to.haveElements([
        insertionPoint,
        element2,
        element3,
        element4,
        element6,
        element7,
      ]);
    });
  });
});
