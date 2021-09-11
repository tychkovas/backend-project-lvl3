const debugApp = 'ON';
const clog = (...par) => {
  if (debugApp === 'ON') console.log(...par);
};

export default clog;
