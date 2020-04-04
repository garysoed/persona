import { assert, createSpyWindow, fake, should, test } from 'gs-testing';

import { FakeMediaQuery } from '../testing/mock-match-media';

import { mediaQuery } from './media-query';


test('persona.input.mediaQuery', init => {
  const QUERY = 'query';

  const _ = init(() => {
    const mockWindow = createSpyWindow();
    const input = mediaQuery(QUERY, mockWindow);

    return {input, mockWindow};
  });

  test('getValue', () => {
    should(`emit the correct value on changes`, () => {
      const fakeQuery = new FakeMediaQuery(QUERY);
      fake(_.mockWindow.matchMedia).when(QUERY).return(fakeQuery as any);

      assert(_.input.getValue()).to.emitWith(false);

      fakeQuery.matches = true;
      assert(_.input.getValue()).to.emitWith(true);
    });
  });
});
