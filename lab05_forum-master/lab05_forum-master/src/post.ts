interface post {
  postId: number;
  sender: string;
  title: string;
  timeSent: number;
  content: string;
  comment: comments[];
}

interface comments {
  commentId: number;
  sender: string;
  comment: string;
  timeSent: number;
}

let data = [];
export function create(sender: string, title: string, content: string) {
  let id = data.length + 1;
  // TODO: Implement
  //console.log('Do something with:', sender, title, content);
  if (sender === "" || title === "" || content === "") {
    return {error:"can not use empty parameter"};
  }
  let object = { postId: id, sender: sender, title: title, timeSent: Date.now(), content: content, comment: [] };
  data.push(object);
  return { postId: id };
}

export function comment_function(postId: number, sender: string, comment: string) {

  if (postId > data.length || postId < 1) {
    return {error:"id is not valid"};
  }

  if (sender === "" || comment === "") {
    return {error:"can not use empty parameter"};
  }

  
  let id;

  for (let i of data) {

    if (i.postId === postId) {
      id = i.comment.length + 1;

      let object = { commentId: id, sender: sender, comment: comment, timeSent: Date.now() };
      i.comment.push(object);
    }
  }
  return { commentId: id };
}

export function view(postId: number) {

  if (postId > data.length || postId < 1) {
    return {error:"id is not valid"};
  }
  let object;
  for (let i of data) {

    if (i.postId === postId) {
      let comment_reverse = i.comment.reverse();

      object = { 
        postId: i.postId, 
        sender: i.sender, 
        title: i.title, 
        timeSent: i.timeSent, 
        content: i.content, 
        comments: comment_reverse 
      };
      console.log(object)
      return {post: object};
    }
  }

  
}


export function postsView() {
  let data_reverse = data.reverse();
  let result = [];
  for (let i of data_reverse) {
    let object = {
      postId: i.postId,
      sender: i.sender,
      title: i.title,
      timeSent: i.timeSent
    };
    result.push(object);
  }
  return {posts: result};
}
function setdata(data1) {
  return data = data1;
}
export function clear() {
  setdata([]);
  return {};
}