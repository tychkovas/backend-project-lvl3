/* eslint-disable max-len */
import path, { join } from 'path';
import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import { promises as fsp } from 'fs';
import Listr from 'listr';

import getPageForSave from './parsing.js';

const nameSpaceLog = 'page-loader';

const log = debug(nameSpaceLog);

debug('booting %o', nameSpaceLog);

const getNameFile = (url, separator = '') => url.replace(/^\w*?:\/\//mi, '')
  .replace(/\/$/, '')
  .replace(/\W/mig, separator)
  .concat('.html');

const getNameDir = (nameFile) => path.parse(nameFile).name.concat('_files');

const loadFiles = ({ href, path: pathSave }, _outputPath) => {
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

const pageLoad = (pageAddress, outputPath) => {
  log('---- start load %o ----', nameSpaceLog);
  log('pageAddress: ', pageAddress);
  log('outputPath:  ', outputPath);
  const nameSaveFile = getNameFile(pageAddress, '_');
  const pathSaveFile = path.join(outputPath, nameSaveFile); //
  const pathSave = getNameDir(getNameFile(pageAddress, '-'));
  const pathSaveDir = join(outputPath, pathSave);

  log('load html:', pageAddress);

  return axios.get(pageAddress)
    .then((response) => {
      const { html, assets: dataLinks } = getPageForSave(response.data, pathSave, pageAddress);
      log('save html:', pathSaveFile);
      if (dataLinks.length !== 0)log('creating a folder:', nameSaveFile);
      const promiseMkDir = (dataLinks.length === 0) ? null : fsp.mkdir(pathSaveDir);
      const promiseWriteFile = fsp.writeFile(pathSaveFile, html, 'utf-8');
      return Promise.all([promiseWriteFile, promiseMkDir]).then(() => dataLinks);
    })
    .then((dataLinks) => {
      const load = (item) => (
        {
          title: item.href,
          task: () => loadFiles(item, outputPath),
        }
      );

      return new Listr(dataLinks.map(load), { concurrent: true }).run();
    })
    .then(() => log('---- finish load %o ----', nameSpaceLog))
    .then(() => pathSaveFile);
};

export default pageLoad;
