/* eslint-disable max-len */
import path, { join } from 'path';
import axios from 'axios';
import fs, { promises as fsp } from 'fs';

import getPageForSave from './transform.js';

const getNameFile = (url, separator = '') => url.replace(/^\w*?:\/\//mi, '') // ^https?:\/\/
  .replace(/\W/mig, separator)
  .concat('.html');

const getNameDir = (nameFile) => path.parse(nameFile).name.concat('_files');

const pageLoad = (pageAddress, outputPath) => {
  const nameSaveFile = getNameFile(pageAddress, '_');
  console.log('nameSaveFile: ', nameSaveFile);
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  console.log('outputPath: ', outputPath);
  console.log(' - pathSaveFile = ', pathSaveFile);
  const pathSave = getNameDir(getNameFile(pageAddress, '-'));
  console.log('pathSave: ', pathSave);
  const pathSaveDir = join(outputPath, getNameDir(nameSaveFile));
  console.log('pathSaveDir: ', pathSaveDir);
  let linksImg;

  const result = axios.get(pageAddress)
    .then((response) => response.data)
    .catch((err) => console.log('\n error axios get: err.response.status =',
      err.response.status))
    // .then((data) => get)
    .then((data) => {
      console.log('data: ', data);
      const { html: page, dataLinks } = getPageForSave(data, pathSave, pageAddress);
      // console.log('page: ', page);
      console.log('dataLinks: ', dataLinks);
      linksImg = dataLinks;
      return fsp.writeFile(pathSaveFile, page, 'utf-8');
    })
    .then(() => axios({
      method: 'get',
      url: linksImg[0].href,
      responseType: 'stream', // 'arraybuffer', fs.promises.writeFile(itemPath, response.data, 'utf-8');
    }))
    .catch((error) => console.log('\n error axios =', error))
    .then((response) => {
      fsp.mkdir(path.join(outputPath, pathSave));
      return response;
    })
    .catch((error) => console.log('\n error mkdir =', error))
    .then((response) => {
      console.log('response.status', response.status); // код ответа
      // console.log("response.headers", response.headers); // напечатает заголовки
      // console.log("response.data", response.data); // тело ответа
      response.data.pipe(fs.createWriteStream(path.join(outputPath, linksImg[0].path)));
      // fsp.writeFile(path.join(outputPath, linksImg[0].path), response.data, 'binary');
    })
    .catch((error) => console.log('\n error write file =', error));

  return result;
};

export default pageLoad;
