```javascript

// data is an object
// data include two objects:
// channels and users
// they are arrays include lots of users(user 1, user 2 .... datatype is object) and channels(channel1, channel2 ...)
// messages is included in channels, it's array and include many messages(datatype is object)

const data = {

  users: [
    {
      id: 1,
      email: 'ranivorous@gmail.com',
      nameFirst: 'Rani',
      nameLast: 'Jiang',
      handleStr: 'ranijiang',
      password: 'RaniJiang123',
      // become a member which channel 
      channelId: [],
      // id:1 and id:2 's global_permission should be true
      global_permission: true,

    }
  ]

  channels: [
    {
      id: 1,
      name: 'channel1',
      is_public: false,   //if this is not public, then it's private
      ownerMembers : [],  //store user object
      allMembers : [], //store user object
      start: 0,
      end: start + 50,
      messages: [
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



```

[Optional] short description: 