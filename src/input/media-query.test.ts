import { assert, setup, should, test } from '@gs-testing/main';
import { fake, SpyObj } from '@gs-testing/spy';
import { createSpyWindow } from 'gs-testing/src/spy/spy';
import { FakeMediaQuery } from '../testing/mock-match-media';
import { mediaQuery, MediaQueryInput } from './media-query';

test('persona.input.mediaQuery', () => {
  const QUERY = 'query';

  let input: MediaQueryInput;
  let mockWindow: SpyObj<Window>;

  setup(() => {
    mockWindow = createSpyWindow();
    input = mediaQuery(QUERY, mockWindow);
  });

  test('getValue', () => {
    should(`emit the correct value on changes`, async () => {
      const fakeQuery = new FakeMediaQuery(QUERY);
      fake(mockWindow.matchMedia).when(QUERY).return(fakeQuery as any);

      await assert(input.getValue()).to.emitWith(false);

      fakeQuery.matches = true;
      await assert(input.getValue()).to.emitWith(true);
    });
  });
});
