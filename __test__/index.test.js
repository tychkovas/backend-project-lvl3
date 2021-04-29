import nock from 'nock';
import fsp from 'fs/promises';
// import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import pageLoad from '../src/index';




const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);

nock.disableNetConnect();

let expectedPage;
let tempDir;

beforeAll(async () => {
  expectedPage = await fsp.readFile(getFixturesPath('local_test_file.html'), 'UTF-8');
});

beforeEach(async  () => {
  tempDir = await fsp.mkdtemp(join(os.tmpdir(), 'page-loader-'));
})

test('get page', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectedPage);
  
  const url = 'https://ru.hexlet.io/courses';
  await pageLoad(url, tempDir);
  
  const pathActualFile = join(tempDir, 'ru_hexlet_io_courses.html');
  const actualFile = await fsp.readFile(pathActualFile, 'UTF-8');
  expect(actualFile).toBe(expectedPage);
});

afterEach(async () => {
  fsp.rm(tempDir, { recursive: true});
});