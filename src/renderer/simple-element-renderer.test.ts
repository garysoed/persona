import { assert, should, test } from 'gs-testing/export/main';
import { createImmutableList, ImmutableList } from 'gs-tools/export/collect';
import { integerConverter } from 'gs-tools/export/serializer';
import { human } from 'nabu/export/grammar';
import { compose, identity } from 'nabu/export/util';
import { __renderId } from './render-id';
import { __nodeId, SimpleElementRenderer } from './simple-element-renderer';

interface TestObject {
  a: string;
  b: number;
}

test('converter.SimpleElementConverter', () => {
  const TAG_NAME = 'tag-name';
  let converter: SimpleElementRenderer<TestObject>;

  beforeEach(() => {
    converter = new SimpleElementRenderer(
        TAG_NAME,
        {
          a: identity<string>(),
          b: compose(integerConverter(), human()),
        });
  });

  test('getElement_', () => {
    should(`return the correct element`, () => {
      const id = 'id';
      const el = converter['getElement_'](id, null);

      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el[__nodeId]).to.equal(id);
    });

    should(`reuse the previous element if the IDs are equal`, () => {
      const id = 'id';
      const el = Object.assign(document.createElement('div'), {[__nodeId]: id});

      assert(converter['getElement_'](id, el)).to.equal(el);
    });

    should(`create a new element if previous element has a different ID`, () => {
      const id = 'id';
      const oldEl = Object.assign(document.createElement('div'), {[__nodeId]: 'id2'});
      const el = converter['getElement_'](id, oldEl);

      assert(el).toNot.equal(oldEl);
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el[__nodeId]).to.equal(id);
    });
  });

  test('render', () => {
    should(`render correctly`, () => {
      const insertionNode = document.createComment('insert');
      const root = document.createElement('div');
      root.appendChild(insertionNode);

      const el = converter.render({a: 'a', b: 2, [__renderId]: 'id'}, null, root, insertionNode);
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.getAttribute('b')).to.equal('2');
      assert([...createImmutableList(root.childNodes)]).to.haveExactElements([insertionNode, el]);
    });

    should(`ignore null values`, () => {
      const insertionNode = document.createComment('insert');
      const root = document.createElement('div');
      root.appendChild(insertionNode);

      const data = {a: 'a', b: null as any, [__renderId]: 'id'};
      const el = converter.render(data, null, root, insertionNode);
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.hasAttribute('b')).to.beFalse();
      assert([...createImmutableList(root.childNodes)]).to.haveExactElements([insertionNode, el]);
    });
  });
});
