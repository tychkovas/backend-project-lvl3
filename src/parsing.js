import cheerio from 'cheerio';
import path from 'path';

const getNameLoadFile = (prefix, link) => `${prefix}${link.replace(/\//mig, '-')}`;

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

      const linkAdd = (path.extname(pathname) === '') ? pathname.concat('.html') : pathname;
      const newPath = path.join(pathSave, getNameLoadFile(prefixFile, linkAdd));

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
