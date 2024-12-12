import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {firstValueFrom} from 'rxjs';

import {HtmlParseService, ParseType} from './html-parse-service';

test('@persona/src/render/html-parse-service', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));
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
      await asyncAssert(snapshotElement(result!)).to.match(
        'html-parse-service',
      );

      // Run again, should return the same instance.
      await asyncAssert(_.service.parse(raw, supportedType)).to.emitWith(
        result,
      );
    });
  });
});
