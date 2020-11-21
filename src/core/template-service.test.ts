import {assert, should, test} from 'gs-testing';

import {TemplateService} from './template-service';


test('@persona/core/template-service', init => {
  const TAG = 'test-tag';

  const _ = init(() => {
    const service = new TemplateService(
        new Map([
          [TAG, '<div id="test"></div>'],
        ]),
        document,
    );

    return {service};
  });

  test('getTemplate', () => {
    should('create the template element with the correct content', () => {
      const el = _.service.getTemplate(TAG).content;

      assert(el.childElementCount).to.equal(1);
      assert(el.children.item(0)).to.beAnInstanceOf(HTMLDivElement);
      assert(el.children.item(0)!.id).to.equal('test');
    });

    should('throw error if the matching template string cannot be found', () => {
      assert(() => {
        _.service.getTemplate('other-tag');
      }).to.throwErrorWithMessage(/No template found/);
    });

    should('return the previous created template without creating it', () => {
      const el = _.service.getTemplate(TAG);
      const el2 = _.service.getTemplate(TAG);

      assert(el2).to.equal(el);
    });
  });
});
