/* eslint-disable max-len */
/**
 * @jest-environment node
 */
// import debug as debug1 from 'debug';
// import jest from 'jest';
import nock from 'nock';
import fsp from 'fs/promises';
import fs from 'fs';
import os from 'os';
import cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import pageLoad from '../src/index';

const debug = 'ON';

const clog = (...par) => {
  if (debug === 'ON') console.log(...par);
};

const __filename = fileURLToPath(import.meta.url);
clog('__filename:', __filename);
const __dirname = dirname(__filename);
clog('__dirname:', __dirname);

const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);
clog('getFixturesPath:', getFixturesPath('name.tmp'));

const getFileSync = (path, encding = null) => fs.readFileSync(getFixturesPath(path), encding);
const getFile = (path, encding = null) => fsp.readFile(getFixturesPath(path), encding);

const expectedAssets = [
  {
    pathFile: 'assets/nodejs.png',
    encding: null,
    link: '/assets/professions/nodejs.png',
    pathActual: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    pathFile: 'assets/application.css',
    encding: null,
    link: '/assets/application.css',
    pathActual: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  },
  {
    pathFile: 'getted_page/received_page.html',
    encding: 'UTF-8',
    link: '/courses',
    pathActual: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
  },
  {
    pathFile: 'assets/runtime.js',
    encding: null,
    link: '/packs/js/runtime.js',
    pathActual: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
  },
];

nock.disableNetConnect();

let expectedPage;
let resultPage;
let tempDir;

beforeAll(async () => {
  expectedPage = await getFile('getted_page/received_page.html', 'UTF-8');

  expectedAssets.forEach((item) => {
    const file = getFileSync(item.pathFile, item.encding);
    Object.assign(item, { file });
  });

  resultPage = await getFile('result_page/ru_hexlet_io_courses.html', 'UTF-8');
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
    .twice()
    .reply(200, expectedPage);

  nock('https://ru.hexlet.io')
    .get(expectedAssets[0].link)
    .reply(200, expectedAssets[0].file);

  // nock('https://ru.hexlet.io')
  //   .get(expectedAssets[0].link)
  //   .replyWithFile(200, getFixturesPath(expectedAssets[0].pathFile));

  // expectedAssets.forEach((item) => {
  //   nock('https://ru.hexlet.io')
  //     .get(item.link)
  //     .replyWithFile(200, item.path);
  // });

  const url = 'https://ru.hexlet.io/courses';
  await pageLoad(url, tempDir);

  const pathActualFile = join(tempDir, 'ru_hexlet_io_courses.html');
  const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');

  const resultPageFormated = cheerio.load(resultPage).html();
  // clog('rPFormated   :', resultPageFormated);

  expect(actualFile).toBe(resultPageFormated);
  // expect(expectedPage).toBe(expectedPage);

  const pathActualAssets = join(tempDir, expectedAssets[0].pathActual);
  console.log('pathActualAssets: ', pathActualAssets);
  const actualAssets = fs.readFileSync(pathActualAssets);
  expect(actualAssets).toEqual(expectedAssets[0].file);

  console.log('expectedAssets: ', expectedAssets[0].file);
});

afterEach(async () => {
  fsp.rm(tempDir, { recursive: true });
  clog('tempDir: ', tempDir);
});
