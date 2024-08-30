import request from 'sync-request';
import { create, comment_function, view, postsView, clear } from './post';
import { port, url } from './config.json';


const SERVER_URL = `${url}:${port}`;


beforeEach(() => {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear'
  );

});



function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear',
  );

}






function requestCreate(sender: string, title: string, content: string) {
  const res = request(
    'POST',
    SERVER_URL + '/post/create',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        sender: sender,
        title: title,
        content: content,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/post/create', () => {
  test('error', () => {
    expect(requestCreate('', 'ffff', 'ff')).toStrictEqual({ error: expect.any(String) });
    expect(requestCreate('fffff', '', 'ffff')).toStrictEqual({ error: expect.any(String) });
    expect(requestCreate('fffff', 'fffff', '')).toStrictEqual({ error: expect.any(String) });
  });
  test('success', () => {
    expect(requestCreate('Liren', 'hello', 'world')).toMatchObject({ postId: 1 });
    expect(requestCreate('Liren', 'hello1', 'world1')).toMatchObject({ postId: 2 });
    expect(requestCreate('Liren', 'hello2', 'world2')).toMatchObject({ postId: 3 });
    expect(requestCreate('Liren', 'hello3', 'world3')).toMatchObject({ postId: 4 });
  });
  requestClear();
});


function requestComment(postId: number, sender: string, comment: string) {
  const res = request(
    'POST',
    SERVER_URL + '/post/comment',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      json: {
        postId: postId,
        sender: sender,
        comment: comment,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

describe('/post/comment', () => {
  test('error', () => {
    const id = requestCreate('Liren', 'hello1', 'world1');
    expect(requestComment(100, 'fffff', 'ffffff')).toStrictEqual({ error: expect.any(String) });
    expect(requestComment(id.postId, '', 'fffffff')).toStrictEqual({ error: expect.any(String) });
    expect(requestComment(id.postId, 'ffffff', '')).toStrictEqual({ error: expect.any(String) });
  });
  test('success', () => {
    const second = requestCreate('Liren', 'hello1', 'world1');
    expect(requestComment(second.postId, 'fffffff', 'fffffff')).toMatchObject({ commentId: 1 });
    expect(requestComment(second.postId, 'ffffff', 'ffffffff')).toMatchObject({ commentId: 2 });
  });

});




function requestView(postId: number) {
  const res = request(
    'GET',
    SERVER_URL + '/post/view',
    {
      // Note that for PUT/POST requests, you should
      // use the key 'json' instead of the query string 'qs'
      qs: {
        postId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}


describe('/post/view', () => {
  test('error', () => {
    expect(requestView(100)).toStrictEqual({ error: expect.any(String) });
  });
  test('success', () => {
    const first = requestCreate('Liren', 'hello1', 'world1');
    requestComment(first.postId, '1', '1');
    requestComment(first.postId, '2', '2');
    requestComment(first.postId, '3', '3');
    expect(requestView(first.postId)).toMatchObject({
      post: {
        postId: first.postId,
        sender: 'Liren',
        title: 'hello1',
        timeSent: expect.any(Number),
        content: 'world1',
        comments: [
          {
            commentId: 3,
            sender: '3',
            comment: '3',
            timeSent: expect.any(Number),
          },
          {
            commentId: 2,
            sender: '2',
            comment: '2',
            timeSent: expect.any(Number),
          },
          {
            commentId: 1,
            sender: '1',
            comment: '1',
            timeSent: expect.any(Number),
          },
        ],
      }
    });
  });

});

function requestlist() {
  const res = request(
    'GET',
    SERVER_URL + '/post/list'
  );
  return JSON.parse(res.getBody() as string);
}
describe('/post/list', () => {
  test('success', () => {
    const f = requestCreate('1', '1', '1');
    const s = requestCreate('2', '2', '2');
    const z = requestCreate('3', '3', '3');
    expect(requestlist()).toMatchObject({
      posts: [
        {
          postId: z.postId,
          sender: '3',
          title: '3',
          timeSent: expect.any(Number),

        },
        {
          postId: s.postId,
          sender: '2',
          title: '2',
          timeSent: expect.any(Number),

        },
        {
          postId: f.postId,
          sender: '1',
          title: '1',
          timeSent: expect.any(Number),

        },
        
      ]
    });
  });

});
