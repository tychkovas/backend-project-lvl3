import path from 'path';
import axios from 'axios';
import { promises as fsp } from 'fs';

const getNameFile = (url) => url.replace(/^\w*?:\/\//mi, '') // ^https?:\/\/
  .replace(/\W/mig, '_')
  .concat('.html');

const pageLoad = (pageAddress, outputPath) => {
  const nameSaveFile = getNameFile(pageAddress);
  // console.log('nameSaveFile: ', nameSaveFile);
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  // console.log(' - pathSaveFile = ', pathSaveFile);

  const result = axios.get(pageAddress)
    .then((response) => response.data)
    .catch((err) => console.log('\n error axios get: err.response.status =', err.response.status))
    .then((data) => fsp.writeFile(pathSaveFile, data))
    .then(() => pathSaveFile)
    .catch((error) => console.log('\n error write file =', error));

  return result;
};

export default pageLoad;
