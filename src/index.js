import path, { join } from 'path';
import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import { promises as fsp } from 'fs';
import Listr from 'listr';

import getPageLoadData from './parsing.js';

const nameSpaceLog = 'page-loader';

const log = debug(nameSpaceLog);

debug('booting %o', nameSpaceLog);

const getNameFile = (url, separator = '') => url.replace(/^\w*?:\/\//mi, '')
  .replace(/\/$/, '')
  .replace(/\W/mig, separator)
  .concat('.html');

const getNameDir = (nameFile) => path.parse(nameFile).name.concat('_files');

const loadAndSaveFile = ({ href, path: pathSave }, _outputPath) => {
  log('  load file:', href);
  return axios({
    method: 'get',
    url: href,
    responseType: 'arraybuffer',
  })
    .then((response) => {
      log('  save file:', href, 'as:', pathSave);
      return fsp.writeFile(path.join(_outputPath, pathSave), response.data);
    });
};

const loadPage = (pageAddress, outputPath = '') => {
  log('---- start load %o ----', nameSpaceLog);
  log('pageAddress: ', pageAddress);
  log('outputPath:  ', outputPath);
  if (!pageAddress) {
    return Promise.reject(new Error(`site address not defined: ${pageAddress}`));
  }
  const nameSaveFile = getNameFile(pageAddress, '-');
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  const pathSave = getNameDir(getNameFile(pageAddress, '-'));
  const pathSaveDir = join(outputPath, pathSave);

  log('load html:', pageAddress);

  return axios.get(pageAddress)
    .then((response) => {
      const { html, assets } = getPageLoadData(response.data, pathSave, pageAddress);

      log('save html:', pathSaveFile);
      if (assets.length !== 0)log('creating a folder:', nameSaveFile);
      const promiseMkDir = (assets.length === 0) ? null : fsp.mkdir(pathSaveDir);
      const promiseWriteFile = fsp.writeFile(pathSaveFile, html, 'utf-8');

      return Promise.all([promiseWriteFile, promiseMkDir]).then(() => assets);
    })
    .then((assets) => {
      const getTask = (asset) => (
        {
          title: asset.href,
          task: () => loadAndSaveFile(asset, outputPath),
        }
      );

      return new Listr(assets.map(getTask), { concurrent: true }).run();
    })
    .then(() => log('---- finish load %o ----', nameSpaceLog))
    .then(() => pathSaveFile)
    .catch((error) => {
      log(`error: '${error.message}'`);
      log('---- error load %o ----', nameSpaceLog);
      throw error;
    });
};

export default loadPage;
