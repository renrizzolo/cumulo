import { Transformer } from '@parcel/plugin';
import { shouldProcessFile, extractAndRewrite } from './core/extractor.js';

export const cumulo = new Transformer({
  async transform({ asset }) {
    const code = await asset.getCode();
    const id = asset.filePath;

    if (!shouldProcessFile(code, id)) {
      return [asset];
    }

    const result = await extractAndRewrite(code, id);

    if (result.code) {
      asset.setCode(result.code);
    }

    if (!result.css) {
      return [asset];
    }

    asset.invalidateOnFileChange(asset.filePath);

    const uniqueKey = `${asset.filePath}-cumulo-css`;
    asset.addDependency({
      specifier: uniqueKey,
      specifierType: 'esm',
    });

    return [
      asset,
      {
        type: 'css',
        content: result.css,
        uniqueKey,
        sideEffects: true,
      },
    ];
  },
});

export default cumulo;
