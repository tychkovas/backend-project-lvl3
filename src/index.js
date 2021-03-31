import path from 'path';
import axios from 'axios';



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

  try {
    axios.get(pageAddress).
      then((response) => {
        console.log(response);
        // console.log(response.status);
      }).catch((error) => {
        console.log(error);
      });
  } catch (e) {
    if (e.isAxiosError) {
      console.log('e.isAxiosError', e.isAxiosError);
    }
  }

  return pathSaveFile;
};

export default pageLoad;
