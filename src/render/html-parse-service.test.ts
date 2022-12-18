import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {firstValueFrom} from 'rxjs';

import goldens from './goldens/goldens.json';
import {HtmlParseService, ParseType} from './html-parse-service';


test('@persona/src/render/html-parse-service', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const service = new HtmlParseService();
    return {service};
  });

  test('parse', () => {
    should('return the parsed element', async () => {
      const mockEl = document.createElement('div');
      const parsedDoc = new Document();
      parsedDoc.appendChild(mockEl);

      const raw = '<div>raw</div>';
      const supportedType = ParseType.HTML;
      const result$ = _.service.parse(raw, supportedType);
      const result = await firstValueFrom(result$);
      assert(snapshotElement(result!)).to.match('html-parse-service.golden');

      // Run again, should return the same instance.
      assert(_.service.parse(raw, supportedType)).to.emitWith(result);
    });
  });
});
