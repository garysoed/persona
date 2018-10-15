import { assert, match, should } from 'gs-testing/export/main';
import { IntegerParser, StringParser } from 'gs-tools/export/parse';
import { HasPropertiesType, NumberType, StringType } from 'gs-types/export';
import { SimpleElementConverter } from './simple-element-converter';

interface TestObject {
  a: string;
  b: number;
}

describe('converter.SimpleElementConverter', () => {
  const TAG_NAME = 'tag-name';
  let converter: SimpleElementConverter<TestObject>;

  beforeEach(() => {
    converter = new SimpleElementConverter(
        TAG_NAME,
        {
          a: StringParser,
          b: IntegerParser,
        },
        HasPropertiesType({
          a: StringType,
          b: NumberType,
        }));
  });

  describe('convertBackward', () => {
    should(`convert correctly`, () => {
      const el = document.createElement(TAG_NAME);
      el.setAttribute('a', 'a');
      el.setAttribute('b', '2');
      assert(converter.convertBackward(el)).to.equal(match.anyObjectThat().haveProperties({
        a: 'a',
        b: 2,
      }));
    });

    should(`return null if the type is wrong`, () => {
      const el = document.createElement(TAG_NAME);
      el.setAttribute('a', 'a');
      assert(converter.convertBackward(el)).to.beNull();
    });

    should(`return null if tag name is different`, () => {
      const el = document.createElement('div');
      el.setAttribute('a', 'a');
      el.setAttribute('b', '2');
      assert(converter.convertBackward(el)).to.beNull();
    });

    should(`return null if not HTMLElement`, () => {
      const node = document.createComment('comment');
      assert(converter.convertBackward(node)).to.beNull();
    });

    should(`return null if null`, () => {
      assert(converter.convertBackward(null)).to.beNull();
    });
  });

  describe('convertForward', () => {
    should(`convert correctly`, () => {
      // tslint:disable-next-line:no-non-null-assertion
      const el = converter.convertForward({a: 'a', b: 2})!;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.getAttribute('b')).to.equal('2');
    });

    should(`ignore null values`, () => {
      // tslint:disable-next-line:no-non-null-assertion
      const el = converter.convertForward({a: 'a', b: null as any})!;
      assert(el.tagName.toLowerCase()).to.equal(TAG_NAME);
      assert(el.getAttribute('a')).to.equal('a');
      assert(el.hasAttribute('b')).to.beFalse();
    });

    should(`return null if null`, () => {
      assert(converter.convertForward(null)).to.beNull();
    });
  });
});
