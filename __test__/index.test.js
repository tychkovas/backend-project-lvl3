/* eslint-disable max-len */
/**
 * @jest-environment node
 */
// import debug as debug1 from 'debug';
// import jest from 'jest';
import nock from 'nock';
import fsp from 'fs/promises';
// import fs from 'fs';
import os from 'os';
import cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import pageLoad from '../src/index';

const debug = 'ON_';

const clog = (...par) => {
  if (debug === 'ON') console.log(...par);
};

const __filename = fileURLToPath(import.meta.url);
clog('__filename:', __filename);
const __dirname = dirname(__filename);
clog('__dirname:', __dirname);

const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);
clog('getFixturesPath:', getFixturesPath('name.tmp'));

nock.disableNetConnect();

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
  tempDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
  // tempDir = '/tmp/page-loader';
  // fs.mkdirSync('/tmp/page-loader');
  clog('tempDir: ', tempDir);
});

test('download page', async () => {
  nock('https://ru.hexlet.io')
    // .log(debug1)
    .get('/courses')
    .reply(200, expectedPage);

  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, expectedImg);

  const url = 'https://ru.hexlet.io/courses';
  await pageLoad(url, tempDir);

  const pathActualFile = join(tempDir, 'ru_hexlet_io_courses.html');
  const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');

  const resultPageFormated = cheerio.load(resultPage).html();
  clog('rPFormated   :', resultPageFormated);

  expect(actualFile).toBe(resultPageFormated);
  expect(expectedPage).toBe(expectedPage);

  // const pathActualImg = join(tempDir, 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
  // const actualImg = fs.readFileSync(pathActualImg);
  // expect(actualImg).toEqual(expectedImg);
});

afterEach(async () => {
  fsp.rm(tempDir, { recursive: true });
  clog('tempDir: ', tempDir);
});
