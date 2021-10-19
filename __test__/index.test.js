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

const getFileSync = (path, encding = null) => fs.readFileSync(getFixturesPath(path), encding);
const getFile = (path, encding = null) => fsp.readFile(getFixturesPath(path), encding);

const testingUrl = 'https://ru.hexlet.io/courses';

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
    pathFile: 'loaded_page.html',
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
  expectedPage = await getFile('loaded_page.html', 'UTF-8');

  expectedAssets.forEach((item) => {
    const file = getFileSync(item.pathFile, item.encding);
    Object.assign(item, { file });
  });

  resultPage = await getFile('expected_page.html', 'UTF-8');
});

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
  // tempDir = '/tmp/page-loader';
  // fs.mkdirSync('/tmp/page-loader');
  clog('tempDir: ', tempDir);
  nock.cleanAll();
});

test('download page', async () => {
  const scope = nock('https://ru.hexlet.io')
    // .log(debug1)
    .get('/courses')
    .reply(200, expectedPage);

  expectedAssets.forEach((item) => {
    scope.get(item.link)
      .reply(200, item.file);
  });

  await expect(pageLoad(testingUrl, tempDir))
    .resolves.toEqual(join(tempDir, 'ru_hexlet_io_courses.html'));

  const pathActualFile = join(tempDir, 'ru_hexlet_io_courses.html');
  const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');

  const resultPageFormated = cheerio.load(resultPage).html();
  // clog('rPFormated   :', resultPageFormated);

  expect(actualFile).toBe(resultPageFormated);

  expectedAssets.forEach((item) => {
    const pathActualAsset = join(tempDir, item.pathActual);
    const actualAsset = fs.readFileSync(pathActualAsset, item.encding);
    expect(actualAsset).toEqual(item.file);
  });
});

describe('error situations', () => {
  test('file already exists', async () => {
    fs.mkdirSync(join(tempDir, 'ru-hexlet-io-courses_files'));

    const scope = nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, expectedPage);

    expectedAssets.forEach((item) => {
      scope.get(item.link)
        .reply(200, item.file);
    });

    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('EEXIST: file already exists');
  });
  test('permission denied', async () => {
    const scope = nock('https://ru.hexlet.io')
      .get('/courses')
      .twice()
      .reply(200, expectedPage);

    expectedAssets.forEach((item) => {
      scope.get(item.link)
        .twice()
        .reply(200, item.file);
    });

    await expect(pageLoad(testingUrl, '/'))
      .rejects
      .toThrow('EACCES: permission denied');
  });

  test('non-existing directory', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, expectedPage);

    const nonExistingDir = join(tempDir, 'nonExisting');

    await expect(pageLoad(testingUrl, nonExistingDir))
      .rejects
      .toThrow('ENOENT: no such file or directory');
  });
  test('Nock: Not found 404', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(404);

    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('Request failed with status code 404');
  });
  test('Nock: Not found', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('Not found');

    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('Not found');
  });

  test('Nock: Disallowed net connect', async () => {
    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('Nock: Disallowed net connect for "ru.hexlet.io:443/courses"');
  });
  test('Nock: No match for request', async () => {
    nock.cleanAll();
    nock('https://ru.hexlet.io')
      .get('/')
      .reply(200);

    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('Nock: No match for request');
  });
});

afterEach(async () => {
  await fsp.rm(tempDir, { recursive: true });
  clog('tempDir: ', tempDir);
});
