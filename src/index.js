/* eslint-disable max-len */
import path, { join } from 'path';
import axios from 'axios';
import fs, { promises as fsp } from 'fs';

import getPageForSave from './transform.js';

const getNameFile = (url, separator = '') => url.replace(/^\w*?:\/\//mi, '')
  .replace(/\/$/, '')
  .replace(/\W/mig, separator)
  .concat('.html');

const getNameDir = (nameFile) => path.parse(nameFile).name.concat('_files');

const loadFiles = ({ href, path: pathSave }, _outputPath) => axios({
  method: 'get',
  url: href,
  responseType: 'stream',
})
  .catch((error) => console.log('\n error axios get status',
    error.response.status, ', url =', error.config.url))
  .then((response) => {
    response.data.pipe(fs.createWriteStream(path.join(_outputPath, pathSave)));
  })
  .catch((error) => console.log('\n error write file =', error));

const pageLoad = (pageAddress, outputPath) => {
  const nameSaveFile = getNameFile(pageAddress, '_');
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  const pathSave = getNameDir(getNameFile(pageAddress, '-'));
  const pathSaveDir = join(outputPath, pathSave);

  const checkOrCreatOutputPath = (response) => fsp
    .access(outputPath, fs.constants.F_OK)
    .catch(() => fsp.mkdir(outputPath, { recursive: true }))
    .then(() => response);

  return axios.get(pageAddress)
    .catch((err) => console.log('\n error axios get: err.response.status =',
      err.response.status))
    .then(checkOrCreatOutputPath)
    .catch(() => console.error('cannot access output path', outputPath))
    .then((response) => response.data)
    .then((data) => {
      const { html, assets: dataLinks } = getPageForSave(data, pathSave, pageAddress);
      fsp.writeFile(pathSaveFile, html, 'utf-8');
      return dataLinks;
    })
    .catch((error) => console.log('\n error writeFile page =', error))
    .then((dataLinks) => {
      if (dataLinks.length > 0) {
        fsp.mkdir(pathSaveDir);
      }
      return dataLinks;
    })
    .catch((error) => console.log('\n error mkdir =', error))
    .then((dataLinks) => Promise.all(dataLinks.map((item) => loadFiles(item, outputPath))))
    .catch((error) => console.log('\n error Promise all =', error))
    .then(() => pathSaveFile);
};

export default pageLoad;
