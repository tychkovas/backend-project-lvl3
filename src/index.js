import path from 'path';

const pageLoad = (pageAddress, outputPath) => {
  console.log('index - pageAddress', pageAddress, 'outputPath', outputPath);
  //   const pageURL = new URL(pageAddress);
  //   console.log('page protocol', pageURL.protocol.toString());
  //   pageURL.protocol = '';
  //   console.log(pageURL.toString());
  const nameSaveFile = pageAddress.replace(/^\w*?:\/\//mi, '') // ^https?:\/\/
    .replace(/\W/mig, '_')
    .concat('.html');
  const pathSaveFile = path.join(outputPath, nameSaveFile);
  return pathSaveFile;
};

export default pageLoad;
