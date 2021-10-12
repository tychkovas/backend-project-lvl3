/* eslint-disable max-len */
import path, { join } from 'path';
import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import fs, { promises as fsp } from 'fs';

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
    .catch((error) => console.error('error axios get status',
      error.response.status, ', url =', error.config.url))
    .then((response) => {
      log('save file:', href, 'name:', pathSave);
      return fsp.writeFile(path.join(_outputPath, pathSave), response.data);
    })
    .catch((error) => console.error('error write file:', error.message));
};

const pageLoad = (pageAddress, outputPath) => {
  log('start load %o', nameSpaceLog);
  const nameSaveFile = getNameFile(pageAddress, '_');
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  const pathSave = getNameDir(getNameFile(pageAddress, '-'));
  const pathSaveDir = join(outputPath, pathSave);

  const checkOrCreateOutputPath = (response) => fsp
    .access(outputPath, fs.constants.F_OK)
    .catch(() => fsp.mkdir(outputPath, { recursive: true })
      .then(() => log('directory creation:', outputPath)))
    .then(() => response);

  log('load html:', pageAddress);

  return axios.get(pageAddress)
    .catch((err) => console.error('error load html, status:',
      err.response.status, err.message))
    .then(checkOrCreateOutputPath)
    .catch(() => console.error('cannot access output path', outputPath))
    .then((response) => response.data)
    .then((data) => {
      const { html, assets: dataLinks } = getPageForSave(data, pathSave, pageAddress);
      log('save html:', pathSaveFile);
      fsp.writeFile(pathSaveFile, html, 'utf-8');
      return dataLinks;
    })
    .catch((error) => console.error('error write page:', error.message))
    .then((dataLinks) => {
      if (dataLinks.length > 0) {
        log('creating a folder:', nameSaveFile);
        fsp.mkdir(pathSaveDir);
      }
      return dataLinks;
    })
    .catch((error) => console.error('error mkdir =', error.message))
    .then((dataLinks) => Promise.all(dataLinks.map((item) => loadFiles(item, outputPath))))
    .catch((error) => console.error('error loadFiles =', error.message))
    .then(() => log('finish load %o', nameSpaceLog))
    .then(() => pathSaveFile);
};

export default pageLoad;
