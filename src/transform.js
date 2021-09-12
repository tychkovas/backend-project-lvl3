#!/usr/bin/env node
import * as cheerio from 'cheerio';
// import { combineFlagAndOptionalValue } from 'commander';
import path, { join } from 'path';
import clog from '../utils.js';

const getNameLoadFile = (link) => {
 return 'tmp';
};

const getPageForSave = (data, pathLoadFile, url) => {
  clog('data:', data);
  clog('pathLoadFile:', pathLoadFile);
  clog('url:', url);
  const $ = cheerio.load(data, null, false);
  const img = $('img');
  //console.log(' img ==', img);
  img.each((i, el) => {
    const link = $(el).attr('src');
    console.log(' link ==', link);
    const newLink = `${path.join(pathLoadFile, getNameLoadFile(link))}`;
    // $el.attr('src', 'new val');
    console.log(' link ==', newLink);
  });
  // // console.log(' $ = ', $('img').text());
  // console.log(' $ = ', $('img').attr('src'));
  return data;
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