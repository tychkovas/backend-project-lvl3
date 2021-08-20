/**
 * @jest-environment node
 */
import nock from 'nock';
import fsp from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import pageLoad from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);

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
  console.log('tempDir: ', tempDir);
});

test('download page', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectedPage);

  const url = 'https://ru.hexlet.io/courses';
  await pageLoad(url, tempDir);

  const pathActualFile = join(tempDir, 'ru_hexlet_io_courses.html');
  const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');
  expect(actualFile).toBe(resultPage);

  const pathActualImg = join(tempDir, 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
  const actualImg = await fsp.readFile(pathActualImg);
  expect(actualImg).toBe(expectedImg);
});

afterEach(async () => {
  // fsp.rm(tempDir, { recursive: true });
});
