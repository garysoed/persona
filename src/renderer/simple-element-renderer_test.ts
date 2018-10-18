import { assert, should } from 'gs-testing/export/main';
import { IntegerParser, StringParser } from 'gs-tools/export/parse';
import { __renderId } from './render-id';
import { __nodeId, SimpleElementRenderer } from './simple-element-renderer';

interface TestObject {
  a: string;
  b: number;
}

describe('converter.SimpleElementConverter', () => {
  const TAG_NAME = 'tag-name';
  let converter: SimpleElementRenderer<TestObject>;

  beforeEach(() => {
    converter = new SimpleElementRenderer(
        TAG_NAME,
        {
          a: StringParser,
          b: IntegerParser,
        });
  });

  describe('getElement_', () => {
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

  describe('render', () => {
    should(`render correctly`, () => {
      // tslint:disable-next-line:no-non-null-assertion
      const el = converter.render({a: 'a', b: 2, [__renderId]: 'id'}, null)!;
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.getAttribute('b')).to.equal('2');
    });

    should(`ignore null values`, () => {
      // tslint:disable-next-line:no-non-null-assertion
      const el = converter.render({a: 'a', b: null as any, [__renderId]: 'id'}, null)!;
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.hasAttribute('b')).to.beFalse();
    });
  });
});
