// #!/usr/bin/env node
/* eslint-disable function-paren-newline */
import cheerio from 'cheerio';
import path from 'path';

const getNameLoadFile = (prefix, link) => `${prefix}${link.replace(/\//mig, '-')}`;

// https: //ru.hexlet.io/courses
// "/assets/professions/nodejs.png"
// "ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"

const typeAssets = [
  { selector: 'link', attr: 'href' },
  { selector: 'img', attr: 'src' },
  { selector: 'script', attr: 'src' },
];

const getPageForSave = (data, pathSave, url) => {
  const { hostname: curHost } = new URL(url);
  const prefixFile = curHost.replace(/\./ig, '-');
  const assets = [];

  const $ = cheerio.load(data);

  const findAssets = (item) => { // console.log('p', item.selector, item.attr);
    const elements = $(item.selector);
    elements.each((i, el) => {
      const link = $(el).attr(item.attr);
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

export default getPageForSave;

// /*
const result = getPageForSave(
  // eslint-disable-next-line no-multi-str
  '<!DOCTYPE html> \
  <html lang="ru"> \
    <head> \
      <meta charset="utf-8"> \
      <title>Курсы по программированию Хекслет</title> \
      <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css"> \
      <link rel="stylesheet" media="all" href="/assets/application.css" /> \
      <link href="/courses" rel="canonical"> \
    </head> \
    <body> \
      <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" /> \
      <h3> \
        <a href="/professions/nodejs">Node.js-программист</a> \
      </h3> \
      <script src="https://js.stripe.com/v3/"></script> \
      <script src="https://ru.hexlet.io/packs/js/runtime.js"></script> \
    </body> \
  </html> \
</html>',
  'ru-hexlet-io-courses_files',
  'https://ru.hexlet.io/courses');

console.log('\n\nresult =', result);
// */

// <!DOCTYPE html>
// <html lang="ru">
//   <head>
//     <meta charset="utf-8">
//     <title>Курсы по программированию Хекслет</title>
//     <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
//     <link rel="stylesheet" media="all" href="ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css">
//     <link href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html" rel="canonical">
//   </head>
//   <body>
//     <img src="ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png" alt="Иконка профессии Node.js-программист">
//     <h3>
//       <a href="/professions/nodejs">Node.js-программист</a>
//     </h3>
//     <script src="https://js.stripe.com/v3/"></script>
//     <script src="ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js"></script>
//   </body>
// </html>
