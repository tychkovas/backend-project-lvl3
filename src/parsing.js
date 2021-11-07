import cheerio from 'cheerio';
import path from 'path';

const getNameLoadFile = (prefix, pathname) => prefix
  .concat(pathname.replace(/\//mig, '-'))
  .concat(((path.extname(pathname) === '') ? '.html' : ''));

const typeAssets = [
  { selector: 'link', attr: 'href' },
  { selector: 'img', attr: 'src' },
  { selector: 'script', attr: 'src' },
];

const getPageLoadData = (data, pathSave, url) => {
  const { hostname: curHost } = new URL(url);
  const prefixFile = curHost.replace(/\./ig, '-');
  const assets = [];

  const $ = cheerio.load(data);

  const findAssets = (item) => {
    const elements = $(item.selector);
    elements.each((i, el) => {
      const link = $(el).attr(item.attr);
      if (!link) return;

      const { href, hostname, pathname } = new URL(link, url);

      if (curHost !== hostname) return;

      const newPath = path.join(pathSave, getNameLoadFile(prefixFile, pathname));

      assets.push({ href, path: newPath });

      $(el).attr(item.attr, newPath);
    });
  };

  typeAssets.forEach(findAssets);

  return {
    html: $.html(),
    assets,
  };
};

export default getPageLoadData;
