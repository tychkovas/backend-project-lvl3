/**
 * @jest-environment node
 */
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import cheerio from 'cheerio';
import getPageLoadData from '../src/parsing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturesPath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

let loadedOriginalPage;
let expectedConvertedPage;

const url = 'https://ru.hexlet.io/courses';
const pathSave = 'ru-hexlet-io-courses_files';

const expectedAssets = [
  {
    href: 'https://ru.hexlet.io/assets/professions/nodejs.png',
    path: path.join(pathSave, 'ru-hexlet-io-assets-professions-nodejs.png'),
  },
  {
    href: 'https://ru.hexlet.io/assets/application.css',
    path: path.join(pathSave, 'ru-hexlet-io-assets-application.css'),
  },
  {
    href: 'https://ru.hexlet.io/courses',
    path: path.join(pathSave, 'ru-hexlet-io-courses.html'),
  },
  {
    href: 'https://ru.hexlet.io/packs/js/runtime.js',
    path: path.join(pathSave, 'ru-hexlet-io-packs-js-runtime.js'),
  },
];

test('parsing page', async () => {
  loadedOriginalPage = await fsp.readFile(getFixturesPath('loaded_page.html'), 'UTF-8');
  expectedConvertedPage = await fsp.readFile(getFixturesPath('expected_page.html'), 'UTF-8');

  const { html: receivedPage, assets } = getPageLoadData(loadedOriginalPage, pathSave, url);

  expectedAssets.forEach((item) => expect(assets).toContainEqual(item));

  const expectedPage = cheerio.load(expectedConvertedPage).html();

  expect(receivedPage).toBe(expectedPage);
});
