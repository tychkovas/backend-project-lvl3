/**
 * @jest-environment node
 */
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import cheerio from 'cheerio';
import getPageLoadData from '../src/parsing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const getFixturesPath = (filename) => join(__dirname, '..', '__fixtures__', filename);

let loadedOriginalPage;
let expectedConvertedPage;

const expectedAssets = [
  {
    href: 'https://site.com/blog/about/assets/styles.css',
    path: 'site-com-blog-about_files/site-com-blog-about-assets-styles.css',
  },
  {
    href: 'https://site.com/blog/about',
    path: 'site-com-blog-about_files/site-com-blog-about.html',
  },
  {
    href: 'https://site.com/photos/me.jpg',
    path: 'site-com-blog-about_files/site-com-photos-me.jpg',
  },
  {
    href: 'https://site.com/assets/scripts.js',
    path: 'site-com-blog-about_files/site-com-assets-scripts.js',
  },
];

test('parsing S page', async () => {
  const url = 'https://site.com/blog/about';
  const pathSave = 'site-com-blog-about_files';

  loadedOriginalPage = await fsp.readFile(getFixturesPath('/hex/site-com-blog-about.html'), 'UTF-8');
  expectedConvertedPage = await fsp.readFile(getFixturesPath('/hex/expected/site-com-blog-about.html'), 'UTF-8');

  const { html: receivedPage, assets } = getPageLoadData(loadedOriginalPage, pathSave, url);

  // expectedAssets.forEach((item) => expect(assets).toContainEqual(item));
  const expectedPage = cheerio.load(expectedConvertedPage.trim()).html();
  expect(receivedPage.trim()).toBe(expectedConvertedPage.trim());
  expect(receivedPage.trim()).toEqual(expectedPage);

  expect(assets).toContainEqual(expectedAssets[0]);
  expect(assets).toContainEqual(expectedAssets[1]);
  expect(assets).toContainEqual(expectedAssets[2]);
  expect(assets).toContainEqual(expectedAssets[3]);
});
