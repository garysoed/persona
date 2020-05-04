import { assert, createSpyInstance, fake, resetCalls, should, test } from 'gs-testing';

import { InnerHtmlParseService } from './inner-html-parse-service';


test('@persona/render/inner-html-parse-service', init => {
  const _ = init(() => {
    const mockDOMParser = createSpyInstance(DOMParser);
    const service = new InnerHtmlParseService(mockDOMParser);
    return {service, mockDOMParser};
  });

  test('parse', () => {
    should(`return the parsed element`, () => {
      const mockEl = document.createElement('div');
      const parsedDoc = new Document();
      parsedDoc.appendChild(mockEl);
      fake(_.mockDOMParser.parseFromString).always().return(parsedDoc);

      const raw = 'raw';
      const supportedType = 'text/xml';
      assert(_.service.parse(raw, supportedType)).to.emitWith(mockEl);
      assert(_.mockDOMParser.parseFromString).to.haveBeenCalledWith(raw, supportedType);

    });

    should(`return the cached data if any`, () => {
      const mockEl = document.createElement('div');
      const parsedDoc = new Document();
      parsedDoc.appendChild(mockEl);
      fake(_.mockDOMParser.parseFromString).always().return(parsedDoc);

      const raw = 'raw';
      const supportedType = 'text/xml';
      // Get the initial parse.
      _.service.parse(raw, supportedType);

      resetCalls(_.mockDOMParser.parseFromString);
      assert(_.service.parse(raw, supportedType)).to.emitWith(mockEl);
      assert(_.mockDOMParser.parseFromString).toNot.haveBeenCalled();
    });
  });
});
