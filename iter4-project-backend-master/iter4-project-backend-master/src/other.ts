
import { setData } from './dataStore';
import { Data } from './interfaces';
import fs from 'fs';

/**
  * initialise the object data that stored in dataStore.js
  * @returns {} - return an empty object
*/
export function clearV1() {
  // rm all img in img directory
  const folderPath = './img/';
  // make sure if /img is created
  if (fs.existsSync(folderPath)) {
    fs.rmdir(folderPath, { recursive: true }, (err) => {
      if (err) throw err;
    });
    fs.readdir(folderPath, (err, files) => {
      if (err) throw err;
      // iteration file array
      for (const file of files) {
        fs.unlink(`${folderPath}${file}`, (err) => {
          if (err) throw err;
          console.log(`${file} was deleted successfully.`);
        });
      }
    });
  }
  const data: Data = {};
  setData(data);
  return {};
}
