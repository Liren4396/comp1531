// YOU SHOULD MODIFY THIS OBJECT BELOW
import fs from 'fs';
import { Data } from './interfaces';
let data: Data = {};

/*
// data is an object
// data include two objects:
// channels and users and user
// they are arrays include lots of users(user 1, user 2 .... datatype is object) and channels(channel1, channel2 ...)
// messages is included in channels, it's array and include many messages(datatype is object)
// user include basic information about an user, and authUser's datas are used to link other two objects: users and
// channels,
*/
/*
let data: Data = {

  users: [
    {
      uId: 1,
<<<<<<< HEAD
=======
<<<<<<< src/dataStore.ts

=======
>>>>>>> src/dataStore.ts
>>>>>>> 9d55cae320b0ba19f12a50249cccb3b3f6a5ab9e
      token: string random value between 0-10000000
      email: 'ranivorous@gmail.com',
      nameFirst: 'Rani',
      nameLast: 'Jiang',
      handleStr: 'ranijiang',
      password: 'RaniJiang123',
      // become a member which channel
      channelId: [],
      global_permission: true,  // true is owner permission and false is member permission

    }

  ],
  dms: [
    {
      id: 1,
      creatorId: 1,
      memberName: ["ahandle1", "bhandle2", "chandle3"],
      memberId: [2, 3, 4]
    }
  ]
  channels: [
    {
      id: 1,
      name: 'channel1',
      isPublic: false,   //if this is not public, then it's private
      ownerMembers: [store user objects],
      allMembers: [store user objects],
      start: 0,
      end: 0,
      messages:
      [
        {
          messageId: 1,
          uId: 1,
          message: 'Hello world',
          timeSent: 1582426789,
        },
        {
          messageId: 2,
          uId: 2,
          message: 'Hello world',
          timeSent: 1582426790,
        },
      ]
    },
  ],
}
*/

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

export function getData(): Data {
  fileLoadData();
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2

export function setData(newData: Data) {
  data = newData;
  fileSaveData();
}

// Saves the data to a file dataStore.json
function fileSaveData() {
  try {
    fs.writeFileSync('dataStore.json', JSON.stringify(data, null, 2));
  } catch (err) {}
}

// Updates the data based on the contents of dataStore.json
function fileLoadData() {
  try {
    data = JSON.parse(fs.readFileSync('dataStore.json', 'utf8'));
  } catch (err) {}
}
