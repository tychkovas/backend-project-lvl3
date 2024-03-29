/**
 * @jest-environment node
 */
import nock from 'nock';
import fsp from 'fs/promises';
import os from 'os';
import prettier from 'prettier';
import { fileURLToPath } from 'url';
import path from 'path';
import pageLoad from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturesPath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const getFile = (pathFile, encding = null) => fsp.readFile(getFixturesPath(pathFile), encding);

const testUrl = 'https://ru.hexlet.io/courses';
const testOrigin = 'https://ru.hexlet.io/';
const testPathName = '/courses';
const nameDirAssets = 'ru-hexlet-io-courses_files';
const nameLoadedPage = 'ru-hexlet-io-courses.html';

const expectedAssets = [
  {
    pathFile: 'assets/nodejs.png',
    encding: null,
    link: '/assets/professions/nodejs.png',
    pathActual: path.join(nameDirAssets, 'ru-hexlet-io-assets-professions-nodejs.png'),
  },
  {
    pathFile: 'assets/application.css',
    encding: null,
    link: '/assets/application.css',
    pathActual: path.join(nameDirAssets, 'ru-hexlet-io-assets-application.css'),
  },
  {
    pathFile: 'loaded_page.html',
    encding: 'UTF-8',
    link: '/courses',
    pathActual: path.join(nameDirAssets, nameLoadedPage),
  },
  {
    pathFile: 'assets/runtime.js',
    encding: null,
    link: '/packs/js/runtime.js',
    pathActual: path.join(nameDirAssets, 'ru-hexlet-io-packs-js-runtime.js'),
  },
];

const dataNetError = [
  ['Request failed with status code 404',
    {
      setUrl: testUrl,
      replyArg: [404],
    },
  ],
  ['Request failed with status code 500',
    {
      setUrl: testUrl,
      replyArg: [500],
    },
  ],
  ['Nock: No match for request',
    {
      setUrl: 'https://ru.hexlet.io/',
      replyArg: [200],
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

const formatFile = (file) => prettier.format(file, {
  parser: 'html',
  htmlWhitespaceSensitivity: 'ignore',
});

const ignoreError = (error) => `ignore error:${error.message}`;

const cleanWokrDir = async (fileName, dirName) => {
  await fsp.rm(path.resolve(process.cwd(), fileName)).catch(ignoreError);
  await fsp.rmdir(path.resolve(process.cwd(), dirName)).catch(ignoreError);
};

beforeEach(async () => {
  cleanWokrDir(nameLoadedPage, nameDirAssets);
});

beforeAll(async () => {
  expectedPage = await getFile('loaded_page.html', 'UTF-8');

  await Promise.all(expectedAssets.map((item) => getFile(item.pathFile, item.encding)
    .then((file) => Object.assign(item, { file }))));

  resultPage = await getFile('expected_page.html', 'UTF-8');
});

describe('successful', () => {
  describe('load page', () => {
    beforeAll(async () => {
      tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
      nock.cleanAll();

      const scope = nock(testOrigin)
        .get(testPathName)
        .reply(200, expectedPage);

      expectedAssets.forEach((item) => {
        scope.get(item.link)
          .reply(200, item.file);
      });
    });
    test('html', async () => {
      await expect(pageLoad(testUrl, tempDir))
        .resolves.toEqual(path.join(tempDir, nameLoadedPage));

      const pathActualFile = path.join(tempDir, nameLoadedPage);
      const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');

      expect(formatFile(actualFile)).toBe(formatFile(resultPage));
    });

    test.each(expectedAssets.map((assets) => [assets.pathFile, assets]))('load %s', async (_, item) => {
      const pathActualAsset = path.join(tempDir, item.pathActual);
      const actualAsset = await fsp.readFile(pathActualAsset, item.encding);

      expect(actualAsset).toEqual(item.file);
    });
  });

  test('failed to download resource', async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    console.log('tempDir: ', tempDir);
    nock.cleanAll();

    nock(testOrigin)
      .get(testPathName)
      .reply(200, expectedPage);

    await expect(pageLoad(testUrl, tempDir))
      .resolves.toEqual(path.resolve(tempDir, nameLoadedPage));

    await expect(fsp.readdir(path.resolve(tempDir, nameDirAssets)))
      .resolves
      .toEqual([]);
  });

  test('download to current workdir', async () => {
    nock(testOrigin)
      .get(testPathName)
      .reply(200, '<html>/</html>');

    await expect(pageLoad(testUrl))
      .resolves.toEqual(path.resolve(process.cwd(), nameLoadedPage));

    cleanWokrDir(nameLoadedPage, nameDirAssets);
  });
});

describe('error situations', () => {
  beforeEach(async () => {
    tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    nock.cleanAll();
  });

  describe('fs', () => {
    test.each(dataFsError)('fs: %s', async (_name, data) => {
      nock(testOrigin)
        .get(testPathName)
        .reply(200, expectedPage);

      await expect(pageLoad(testUrl, data.outputPath))
        .rejects
        .toThrow(data.error);
    });
  });

  describe('net', () => {
    test.each(dataNetError)('net: %s', async (error, data) => {
      const { origin, pathname } = new URL(data.setUrl);

      nock(origin)
        .get(pathname)
        .reply(...data.replyArg);

      await expect(pageLoad(testUrl, tempDir))
        .rejects
        .toThrow(error);
    });
  });

  test('net: Nock: Not found', async () => {
    nock(testOrigin)
      .get(testPathName)
      .replyWithError('Not found');

    await expect(pageLoad(testUrl, tempDir))
      .rejects
      .toThrow('Not found');
  });
});

test('call without arguments', async () => {
  await expect(pageLoad())
    .rejects
    .toThrow('site address not defined:');
});
