/**
 * Add type annotations to function parameters and replace all type stubs 'any'.
 *
 * Note: All functions in this lab are pure functions (https://en.wikipedia.org/wiki/Pure_function)
 * You should NOT introduce a "dataStore" or use any global variables in this file.
 */

export interface Madrigal {

  name: string;
  age: number;
  gift?: string;
}

export interface Song {
  // TODO: add type annotations
  name: string;
  singers: string | string[];
}

// TODO: remove 'any' and add type annotations
export function createMadrigal(name: string, age: number, gift? : string): Madrigal {
  if (gift) {
    return { name: name, age: age, gift: gift };
  } else {
    return { name: name, age: age };
  }
}

// TODO: remove 'any' and add type annotations
export function createSong(name: string, singers: string | string[]): Song {
  return { name: name, singers: singers };
}

// TODO: add type annotations
export function extractNamesMixed(array: (Madrigal | Song)[]): string[] {
  let arr = [];
  for (let i of array) {
    arr.push(i.name);
  }

  return arr;
}

// TODO: add type annotations
export function extractNamesPure(array: Madrigal[] | Song[]): string[] {
  let arr = [];
  for (let i of array) {
    arr.push(i.name);
  }

  return arr;
}

// TODO: add type annotations
export function madrigalIsSinger(madrigal: Madrigal, song: Song): boolean {
  if (song.singers.constructor == Array) {
    for (let singer of song.singers) {
      if (singer == madrigal.name) {
        return true;
      }
    }
  } else {
    if (song.singers == madrigal.name) {
      return true;
    }
  }

  return false;
}

function swap(i: number, j: number, madrigals: Madrigal[]) {
  let tmp = madrigals[i];
  madrigals[i] = madrigals[j];
  madrigals[j] = tmp;
}

// TODO: add type annotations
export function sortedMadrigals(madrigals: Madrigal[]): Madrigal[] {
  // TODO: implementation
  for (let i = 0; i < madrigals.length; ++i) {
    for (let j = i + 1; j < madrigals.length; ++j) {
      if (madrigals[i].age > madrigals[j].age) {
        swap(i, j, madrigals);
      }
      if (madrigals[i].age == madrigals[j].age
        && madrigals[i].name > madrigals[j].name) {
          swap(i, j, madrigals);
        }
    }
  }
  return madrigals;
}

// TODO: add type annotations

export function filterSongsWithMadrigals(madrigals: Madrigal[], songs: Song[]): Song[] {
  // TODO: implementation
  let arr = [];

  for (let madrigal of madrigals) {
    for (let song of songs) {
      //console.log(song);
      if (madrigalIsSinger(madrigal, song)) {
        let flag = 0;
        for (let element of arr) {
          if (element === song) {
            flag = 1;
          }
        }
        if (flag == 0) {
          arr.push(song);
        }
        

      }
    }
  }
  return arr;
}

// TODO: add type annotations
export function getMostSpecialMadrigal(madrigals: Madrigal[], songs: Song[]): Madrigal {
  // TODO: implementation
  if (songs.length == 0) {
    return madrigals[0];
  }
  let arr = [];
  for (let madrigal of madrigals) {
    for (let song of songs) {
      if (madrigalIsSinger(madrigal, song)) {
        let flag = 0;
        let obj = {name: madrigal.name, count: 1};
        for (let element of arr) {
          if (element.name == obj.name) {
            element.count++;
            flag = 1;
            break;
          }
        }
        if (flag == 0) {
          arr.push(obj);
        }
      }
    }
  }
  let max = 0;
  let max_name;
  for (let i of arr) {
    if (i.count > max) {
      max = i.count;
      max_name = i.name;
    }
  }
  for (let madrigal of madrigals) {
    if (madrigal.name == max_name) {
      return madrigal;
    }
  }
}
