/* eslint-disable max-len */
import path, { join } from 'path';
import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import { promises as fsp } from 'fs';

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
  log('load file:', href);
  return axios({
    method: 'get',
    url: href,
    responseType: 'arraybuffer',
  })
    // .catch((error) => console.error('error axios get status',
    //   error.response.status, ', url =', error.config.url))
    .then((response) => {
      log('save file:', href, 'name:', pathSave);
      return fsp.writeFile(path.join(_outputPath, pathSave), response.data);
    });
    // .catch((error) => console.error('error write file:', error.message));
};

const pageLoad = (pageAddress, outputPath) => {
  log('\nstart load %o', nameSpaceLog);
  log('\npageAddress: ', pageAddress);
  log('outputPath:  ', outputPath);
  const nameSaveFile = getNameFile(pageAddress, '_');
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  const pathSave = getNameDir(getNameFile(pageAddress, '-'));
  const pathSaveDir = join(outputPath, pathSave);

  log('load html:', pageAddress);

  return axios.get(pageAddress)
    .then((response) => {
      const { html, assets: dataLinks } = getPageForSave(response.data, pathSave, pageAddress);
      log('save html:', pathSaveFile);
      const promiseMkDir = (dataLinks.length === 0) ? null : fsp.mkdir(pathSaveDir);
      return Promise.all([fsp.writeFile(pathSaveFile, html, 'utf-8'), promiseMkDir])
      // return fsp.writeFile(pathSaveFile, html, 'utf-8')
        .then(() => dataLinks);
    })
    .then((dataLinks) => Promise.all(dataLinks.map((item) => loadFiles(item, outputPath))))
    // .catch((error) => console.error('error loadFiles =', error.message))
    .then(() => log('finish load %o/n', nameSpaceLog))
    .then(() => pathSaveFile);
};

export default pageLoad;
