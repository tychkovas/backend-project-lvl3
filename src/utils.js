import path from 'path';

export const getNameFile = (url) => url.replace(/^\w*?:\/\//mi, '')
  .replace(/\/$/, '')
  .replace(/\W/mig, '-')
  .concat('.html');

export const getNameDir = (url) => path.parse(getNameFile(url)).name.concat('_files');
