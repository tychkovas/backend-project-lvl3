/* eslint-disable max-len */
/**
 * @jest-environment node
 */
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import cheerio from 'cheerio';
import getPageForSave from '../src/transform';

const debug = 'ON_';
const clog = (...par) => {
  if (debug === 'ON') console.log(...par);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);

let expectedPage;
let resultPage;

beforeAll(async () => {
  expectedPage = await fsp.readFile(getFixturesPath('getted_page/local_test_file.html'), 'UTF-8');
  resultPage = await fsp.readFile(getFixturesPath('result_page/ru_hexlet_io_courses.html'), 'UTF-8');
});

const expectedAssets = [
  { href: 'https://ru.hexlet.io/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
  { link: '/assets/application.css', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css' },
  { link: '/courses', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html' },
  { link: '/assets/professions/nodejs.png', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png' },
  // { link: '/professions/nodejs', path: '/professions/nodejs' },
  { link: 'https://ru.hexlet.io/packs/js/runtime.js', path: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js' },
  // { link: '', path: '' },
];

test('transform page', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const pathSave = 'ru-hexlet-io-courses_files';

  const { html: resultTranform, dataLinks: assets } = getPageForSave(expectedPage, pathSave, url);
  console.log(' assets: ', assets);

  expect(assets).toContainEqual(expectedAssets[0]);
  // expect(assets).toContainEqual(expectedAssets[1]);
  // expect(assets).toContainEqual(expectedAssets[2]);
  // expect(assets).toContainEqual(expectedAssets[3]);
  // expect(assets).toContainEqual(expectedAssets[4]);

  // const { href: link, path: pathFile } = dataLinks[0];

  // expect(pathFile).toStrictEqual('ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
  // expect(link).toStrictEqual('https://ru.hexlet.io/assets/professions/nodejs.png');

  const resultPageFormated = cheerio.load(resultPage).html();
  clog('rPFormated   :', resultPageFormated);
  clog('expectedPage :', resultTranform);

  // expect(resultTranform).toBe(resultPageFormated);
});

test('test_ok', () => {
  expect(1).toEqual(2 - 1);
});
