import path from 'path';
import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import { promises as fsp } from 'fs';
import Listr from 'listr';

import getPageLoadData from './parsing.js';

const nameSpaceLog = 'page-loader';

const log = debug(nameSpaceLog);

debug('booting %o', nameSpaceLog);

const getNameFile = (url) => url.replace(/^\w*?:\/\//mi, '')
  .replace(/\/$/, '')
  .replace(/\W/mig, '-')
  .concat('.html');

const getNameDir = (url) => path.parse(getNameFile(url)).name.concat('_files');

const loadAndSaveFile = ({ href, path: pathSave }, _outputPath) => {
  log('  load file:', href);
  return axios({
    method: 'get',
    url: href,
    responseType: 'arraybuffer',
  })
    .then((response) => {
      log('  save file:', href, 'as:', pathSave);
      return fsp.writeFile(path.resolve(_outputPath, pathSave), response.data);
    }, ((error) => {
      log('  fail load:', href);
      throw error;
    }));
};

const loadPage = (pageAddress, outputPath = process.cwd()) => {
  log('---- start load %o ----', nameSpaceLog);
  log('pageAddress: ', pageAddress);
  log('outputPath:  ', outputPath);
  if (!pageAddress) {
    return Promise.reject(new Error(`site address not defined: ${pageAddress}`));
  }
  const nameSaveFile = getNameFile(pageAddress, '-');
  const pathSaveFile = path.resolve(outputPath, nameSaveFile);
  const pathSave = getNameDir(pageAddress);
  const pathSaveDir = path.resolve(outputPath, pathSave);
  let pageData;

  log('load html:', pageAddress);
  return axios.get(pageAddress)
    .then((response) => {
      pageData = getPageLoadData(response.data, pathSave, pageAddress);
    })
    .then(() => fsp.access(pathSaveDir).catch(() => {
      log('creating a folder:', nameSaveFile);
      return fsp.mkdir(pathSaveDir);
    }))
    .then(() => {
      log('save html:', pathSaveFile);
      return fsp.writeFile(pathSaveFile, pageData.html, 'utf-8');
    })
    .then(() => {
      const getTask = (asset) => (
        {
          title: asset.href,
          task: () => loadAndSaveFile(asset, outputPath),
        }
      );

      return new Listr(pageData.assets.map(getTask), { concurrent: true, exitOnError: false })
        .run()
        .catch(() => log('failed to load some assets'));
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
