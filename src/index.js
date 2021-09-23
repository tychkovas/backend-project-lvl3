import path, { join } from 'path';
import axios from 'axios';
import fs, { promises as fsp } from 'fs';

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
  const pathSave = getNameDir(nameSaveFile);
  console.log('pathSave: ', pathSave);
  const pathSaveDir = join(outputPath, getNameDir(nameSaveFile));
  console.log('pathSaveDir: ', pathSaveDir);

  const result = axios.get(pageAddress)
    .then((response) => response.data)
    .catch((err) => console.log('\n error axios get: err.response.status =',
      err.response.status))
    // .then((data) => get)
    .then((data) => {
      console.log('data: ', data);
      const { page, links } = getPageForSave(data, pathSave, pageAddress);
      console.log('links: ', links);
      fsp.writeFile(pathSaveFile, page);
      return links;
    })
    .then((data) => {
      console.log('data links: ', data);
      if (data.length === 0) {
        data.push('https:/ru.hexlet.io/courses/assets/professions/nodejs.png');
      }
      return axios({
        method: 'get',
        url: data[0],
        // url: 'https://cdn2.hexlet.io/store/derivatives/77fbe30ebc2df893abdaf4f1dc507788/fill_webp-600-400.webp',
        // url: 'https://yastatic.net/s3/home-static/_/s/u/EmT7m7r1fLfN1qRy-imBYNufg.svg',
        responseType: 'stream',
      }) 
        .catch((error) => console.log('\n error axios =', error))
        // .then((response) => response.data.pipe(fsp.createWriteStream(`${pathSaveDir}ada_lovelace.jpg`)));
        .then((response) => {
         console.log("response.status", response.status); // код ответа
         // console.log("response.headers", response.headers); // напечатает заголовки
         // console.log("response.data", response.data); // тело ответа
         response.data.pipe(fs.createWriteStream(path.join("/tmp/", 'ada_lovelace3.jpg')));
          // fsp.writeFile(`ada_lovelace.jpg`, response.data, 'binary');
        });
    })
    // .then(() => fsp.mkdir(pathSaveDir))
    // .then(() => pathSaveFile)
    .catch((error) => console.log('\n error write file =', error));

  return result;
};

export default pageLoad;
