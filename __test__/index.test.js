/**
 * @jest-environment node
 */
import nock from 'nock';
import fsp from 'fs/promises';
import fs from 'fs';
import os from 'os';
import cheerio from 'cheerio';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import pageLoad from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);

const getFileSync = (path, encding = null) => fs.readFileSync(getFixturesPath(path), encding);
const getFile = (path, encding = null) => fsp.readFile(getFixturesPath(path), encding);

const testingUrl = 'https://ru.hexlet.io/courses';
const testOrigin = 'https://ru.hexlet.io/';
const testPathName = '/courses';

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

const dataNetError = [
  ['Request failed with status code 404',
    {
      setUrl: testingUrl,
      replyArg: [404],
      testUrl: testingUrl,
    },
  ],
  ['Request failed with status code 500',
    {
      setUrl: testingUrl,
      replyArg: [500],
      testUrl: testingUrl,
    },
  ],
  ['Nock: No match for request',
    {
      setUrl: 'https://ru.hexlet.io/',
      replyArg: [200],
      testUrl: testingUrl,
    },
  ],
];

const dataFsError = [
  ['permission denied',
    {
      outputPath: '/',
      error: 'EACCES: permission denied',
    },
  ],
  ['non-existing directory',
    {
      outputPath: '/tmp/nonExisting',
      error: 'ENOENT: no such file or directory',
    },
  ],
];

let expectedPage;
let resultPage;
let tempDir;

nock.disableNetConnect();

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
  nock.cleanAll();
});

test('successful loading page', async () => {
  const scope = nock(testOrigin)
    .get(testPathName)
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

  expect(actualFile).toBe(resultPageFormated);

  expectedAssets.forEach((item) => {
    const pathActualAsset = join(tempDir, item.pathActual);
    const actualAsset = fs.readFileSync(pathActualAsset, item.encding);
    expect(actualAsset).toEqual(item.file);
  });
});

describe('error situations', () => {
  describe('fs', () => {
    test.each(dataFsError)('fs: %s', async (_name, data) => {
      nock(testOrigin)
        .get(testPathName)
        .reply(200, expectedPage);

      await expect(pageLoad(testingUrl, data.outputPath))
        .rejects
        .toThrow(data.error);
    });
  });

  test('fs: file already exists', async () => {
    fs.mkdirSync(join(tempDir, 'ru-hexlet-io-courses_files'));

    nock(testOrigin)
      .get(testPathName)
      .reply(200, expectedPage);

    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('EEXIST: file already exists');
  });

  describe('net', () => {
    test.each(dataNetError)('net: %s', async (error, data) => {
      const { origin, pathname } = new URL(data.setUrl);
      nock(origin)
        .get(pathname)
        .reply(...data.replyArg);

      await expect(pageLoad(data.testUrl, tempDir))
        .rejects
        .toThrow(error);
    });
  });

  test('net: Nock: Not found', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('Not found');

    await expect(pageLoad(testingUrl, tempDir))
      .rejects
      .toThrow('Not found');
  });
});

afterEach(async () => {
  await fsp.rm(tempDir, { recursive: true });
});
