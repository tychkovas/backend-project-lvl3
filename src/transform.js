#!/usr/bin/env node
/* eslint-disable function-paren-newline */
import cheerio from 'cheerio';
import path from 'path';

const getPrefixFile = (url, separator) => url
  .match(/([a-zA-Z]+(\.[a-zA-Z]+)+)/i)[0]
  .replace(/\./ig, separator);

const getNameLoadFile = (prefix, link) => `${prefix}${link.replace(/\//mig, '-')}`;

// https: //ru.hexlet.io/courses
// "/assets/professions/nodejs.png"
// "ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"

const getPageForSave = (data, pathSave, url) => {
  const prefixFile = getPrefixFile(url, '-');
  const links = [];

  const $ = cheerio.load(data);
  const img = $('img');

  img.each((i, el) => {
    const link = $(el).attr('src');
    links.push(path.join(url, link));

    const newLink = path.join(pathSave, getNameLoadFile(prefixFile, link));
    $(el).attr('src', newLink);
  });
  return {
    html: $.html(),
    links,
  };
};

export default getPageForSave;

/*
const result = getPageForSave(
  // eslint-disable-next-line no-multi-str
  '<!DOCTYPE html>\
  <html lang="ru">\
    <head>\
      <meta charset="utf-8">\
      <title>Курсы по программированию Хекслет</title>\
    </head>\
    <body>\
      <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />\
      <h3>\
        <a href="/professions/nodejs">Node.js-программист</a>\
      </h3>\
    </body>\
  </html>',
  'ru-hexlet-io-courses_files',
  'https://ru.hexlet.io/courses');

console.log('\n\nresult =', result);
*/
