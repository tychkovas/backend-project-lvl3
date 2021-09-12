import path, { join } from 'path';
import axios from 'axios';
import { promises as fsp } from 'fs';

import getPageForSave from './transform.js';

const getNameFile = (url) => url.replace(/^\w*?:\/\//mi, '') // ^https?:\/\/
  .replace(/\W/mig, '_')
  .concat('.html');

// const getNameDir = (nameFile) => join(path.parse(nameFile).name, '_files');
const getNameDir = (nameFile) => path.parse(nameFile).name.concat('_files');

const pageLoad = (pageAddress, outputPath) => {
  const nameSaveFile = getNameFile(pageAddress);
  console.log('nameSaveFile: ', nameSaveFile);
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  console.log('outputPath: ', outputPath);
  console.log(' - pathSaveFile = ', pathSaveFile);
  const pathSaveDir = join(outputPath, getNameDir(nameSaveFile));
  console.log('pathSaveDir: ', pathSaveDir);

  const result = axios.get(pageAddress)
    .then((response) => response.data)
    .catch((err) => console.log('\n error axios get: err.response.status =', err.response.status))
    // .then((data) => get)
    .then((data) => fsp.writeFile(pathSaveFile, getPageForSave(data, pathSaveFile, pageAddress)))
    .then(() => fsp.mkdir(pathSaveDir))
    // .then(() => pathSaveFile)
    .catch((error) => console.log('\n error write file =', error));

  return result;
};

export default pageLoad;
