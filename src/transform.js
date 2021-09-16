#!/usr/bin/env node
/* eslint-disable function-paren-newline */
import * as cheerio from 'cheerio';
// import { combineFlagAndOptionalValue } from 'commander';
import path, { join } from 'path';
import clog from '../utils.js';

const getNameFile = (url, separator) => url
  .replace(/^\w*?:\/\//mi, '') // ^https?:\/\/
  .replace(/\W/mig, separator);

// const getNameFile2 = (url, separator) => url.replace(/^\w*?:\/\//mi, '').match(/^[^\/]+/mi);
const getPrefixFile = (url, separator) => url
  .match(/([a-zA-Z]+(\.[a-zA-Z]+)+)/i)[0]
  .replace(/\./ig, separator);

const getNameLoadFile = (prefix, link) => `${prefix}${link.replace(/\//mig, '-')}`;

// https: //ru.hexlet.io/courses
// "/assets/professions/nodejs.png"
// "ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"

const getPageForSave = (data, pathSaveDir, url) => {
  clog('data   :', data);
  clog('pathSaveDir:', pathSaveDir);
  clog('url:', url, '\n');

  const pathSave = getNameFile(url, '-').concat('_files');
  console.log('pathSave: ', pathSave);

  const prefixFile = getPrefixFile(url, '-');
  console.log('prefixFile: ', prefixFile);

  clog('');

  const optins = {
    withDomLvl1: true,
    normalizeWhitespace: false,
    xmlMode: false,
    decodeEntities: true,
  };
  const $ = cheerio.load(data, optins, true);

  clog('load $ :', $.html());

  const img = $('img'); // console.log(' img ==', img);
  img.each((i, el) => {
    const link = $(el).attr('src');
    console.log(' link  ==', link);
    const newLink = `${path.join(pathSave, getNameLoadFile(prefixFile, link))}`;
    console.log(' link  ==', newLink);
    $(el).attr('src', newLink);
    const link2 = $(el).attr('src');
    console.log(' link2 ==', link2);
  });
  // // console.log(' $ = ', $('img').text());
  // console.log(' $ = ', $('img').attr('src'));
  // return $.root().html();
  return $.html();
};

export default getPageForSave;

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
  '/var/tmp/ru_hexlet_io_courses.html',
  'https://ru.hexlet.io/courses');

console.log('\n\nresult =', result);
