import { Transformer } from '@parcel/plugin';
import { shouldProcessFile, extractCssFromCode, extractCssFromFile } from './core/extractor.js';

export default new Transformer({
  async transform({ asset }) {
    const code = await asset.getCode();
    const id = asset.filePath;

    if (!shouldProcessFile(code, id)) {
      return [asset];
    }

    const css = (await extractCssFromCode(code, id)) || (await extractCssFromFile(id));

    if (!css) {
      return [asset];
    }

    asset.invalidateOnFileChange(asset.filePath);

    return [
      asset,
      {
        type: 'css',
        content: css,
        uniqueKey: `${asset.filePath}-cumulo-css`,
        sideEffects: false,
      },
    ];
  },
});
