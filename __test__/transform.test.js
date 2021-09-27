/* eslint-disable max-len */
/**
 * @jest-environment node
 */
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import cheerio from 'cheerio';
import getPageForSave from '../src/transform';

const debug = 'ON';
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

test('transform page', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const pathSave = 'ru-hexlet-io-courses_files';

  const { html: resultTranform, links } = getPageForSave(expectedPage, pathSave, url);

  expect(...links).toStrictEqual('https://ru.hexlet.io/assets/professions/nodejs.png');

  const resultPageFormated = cheerio.load(resultPage).html();
  clog('rPFormated   :', resultPageFormated);
  clog('expectedPage :', resultTranform);

  expect(resultTranform).toBe(resultPageFormated);
});
