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

const testUrl = 'https://site.com/blog/about';
const testOrigin = new URL(testUrl).origin;
const testPathName = new URL(testUrl).pathname;

const expectedAssets = [
  {
    pathFile: 'hex/expected/site-com-blog-about_files/site-com-blog-about-assets-styles.css',
    encding: null,
    link: '/blog/about/assets/styles.css',
    pathActual: 'site-com-blog-about_files/site-com-blog-about-assets-styles.css',
  },

  {
    pathFile: 'hex/expected/site-com-blog-about_files/site-com-blog-about.html',
    encding: 'UTF-8',
    link: '/blog/about',
    pathActual: 'site-com-blog-about_files/site-com-blog-about.html',
  },
  {
    pathFile: 'hex/expected/site-com-blog-about_files/site-com-photos-me.jpg',
    encding: null,
    link: '/photos/me.jpg',
    pathActual: 'site-com-blog-about_files/site-com-photos-me.jpg',
  },
  {
    pathFile: 'hex/expected/site-com-blog-about_files/site-com-assets-scripts.js',
    encding: null,
    link: '/assets/scripts.js',
    pathActual: 'site-com-blog-about_files/site-com-assets-scripts.js',
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

beforeAll(async () => {
  expectedPage = await getFile('hex/site-com-blog-about.html', 'UTF-8');

  expectedAssets.forEach((item) => {
    const file = getFileSync(item.pathFile, item.encding);
    Object.assign(item, { file });
  });

  resultPage = await getFile('hex/expected/site-com-blog-about.html', 'UTF-8');
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

  const result = await expect(pageLoad(testUrl, tempDir));
  console.log('result: ', result);
  // await expect(pageLoad(testUrl, tempDir))
  //   .resolves.toEqual(join(tempDir, 'site-com-blog-about.html'));

  const pathActualFile = join(tempDir, 'site-com-blog-about.html');
  const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');

  const resultPageFormated = cheerio.load(resultPage).html();

  expect(actualFile).toBe(resultPageFormated);

  expectedAssets.forEach((item) => {
    const pathActualAsset = join(tempDir, item.pathActual);
    const actualAsset = fs.readFileSync(pathActualAsset, item.encding);
    expect(actualAsset).toEqual(item.file);
  });
});

describe.skip('error situations', () => {
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

  test('fs: file already exists', async () => {
    fs.mkdirSync(join(tempDir, 'site-com-blog-about_files'));

    nock(testOrigin)
      .get(testPathName)
      .reply(200, expectedPage);

    await expect(pageLoad(testUrl, tempDir))
      .rejects
      .toThrow('EEXIST: file already exists');
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

afterEach(async () => {
  await fsp.rm(tempDir, { recursive: true });
});
