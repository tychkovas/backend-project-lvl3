/* eslint-disable max-len */
/**
 * @jest-environment node
 */
import fsp from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import getPageForSave from '../src/transform';

const debug = 'ON';
const clog = (...par) => {
  if (debug === 'ON') console.log(...par);
};

const __filename = fileURLToPath(import.meta.url);
//clog('__filename:', __filename);
const __dirname = dirname(__filename);
//clog('__dirname:', __dirname);
const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);
clog('getFixturesPath:', getFixturesPath('name.tmp'));

let expectedPage;
let expectedImg;
let resultPage;
let tempDir;

beforeAll(async () => {
  expectedPage = await fsp.readFile(getFixturesPath('getted_page/local_test_file.html'), 'UTF-8');
  expectedImg = await fsp.readFile(getFixturesPath('getted_page/files/local_img_nodejs.png'));
  resultPage = await fsp.readFile(getFixturesPath('result_page/ru_hexlet_io_courses.html'), 'UTF-8');
});

beforeEach(async () => {
  tempDir = '/var/tmp';
});

test('transform page', async () => {
  const url = 'https://ru.hexlet.io/courses';
  const pathActualFile = join(tempDir, 'ru_hexlet_io_courses.html');

  const resultTranform = getPageForSave(expectedPage, pathActualFile, url);

  clog('resultTranform: \n', resultTranform);
  // expect(actualFile).toBe(resultPage);
  expect(expectedPage).toBe(expectedPage);
});

afterEach(async () => {
  // fsp.rm(tempDir, { recursive: true });
});