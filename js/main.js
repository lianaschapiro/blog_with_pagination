// Fetch and list all posts
function fetchPosts(url) {
  // Call API
  fetch(url)
    .then(response => {
      // Parse link header from response into pagination URLs
      var url;
      var linkHeaders = response.headers.get('Link').split(',');
      var links = {};
      for(var i=0; i<linkHeaders.length; i++) {
        var section = linkHeaders[i].split(';');
        var url = section[0].replace(/<(.*)>/, '$1').trim();
        var name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
      // Populate footer with pagination buttons
      let footer = ''
      if (links.prev != undefined) {
        footer +=
          `<button class="cta" onclick="fetchPosts('${links.prev}')">Previous Posts</button>`
      }
      if (links.next != undefined) {
        footer +=
          `<button class="cta" onclick="fetchPosts('${links.next}')">Next Posts</button>`
      }
        document.getElementById('footer').innerHTML = footer;
      return response.json()
    })
    // Manipulate JSON response data
    .then((json) => {
      let result = ''
      json.forEach((post) => {
        const { id, title, body, userId } = post
        result +=
          `<div class="post-list__post" data-id="${id}">
            <h3 class="post-list__title">${title}</h3>
            <p class="post-list__body">${body}</p>
            <p class="post-list__author">Post Author: ${userId}</p>
          </div>`;
      })
      document.getElementById('result').innerHTML = result;
    })
    .catch(error => console.error(error))
}
fetchPosts('https://jsonplaceholder.typicode.com/posts?_page=1');

// Show individual post
function fetchOnePost(id) {
  fetch('https://jsonplaceholder.typicode.com/posts/'+id+'')
    .then(response => {return response.json() })
    .then((json) => {
      const { id, title, body, userId } = json
      let result =
        `<div class="post-view__post">
          <img class="post-view__img" src="http://lorempixel.com/640/360">
          <h2 class="post-view__title">${title}</h2>
          <p class="post-view__body">${body}</p>
        </div>`;
      document.getElementById('result').innerHTML = result;
      let footer =
        `<button class="cta cta--all-posts">&#8592; See All Posts</button>
        <button class="cta cta--new-post">New Post</button>`
      document.getElementById('footer').innerHTML = footer;
    })
    .catch(error => console.error(error))
}

// Form to create a new post
function newPost() {
  let result =
  `<form id="new-post__form" action="javascript:void(0);" onsubmit="newPostSave()">
    <label for="new-post__title">Title:</label>
    <input required type="text" id="new-post__title" name="new-post__title">
    <label for="body">Body:</label>
    <textarea required id="new-post__body" name="new-post__body"></textarea>
    <label for="new-post__user-id">Your User ID:</label>
    <input required type="number" id="new-post__user-id" name="new-post__user-id">
    <input id="new-post__submit" class="cta" type="submit" value="Submit">
  </form>`
  document.getElementById('result').innerHTML = result;
  let footer =
    `<button class="cta cta--all-posts">&#8592; See All Posts</button>`
  document.getElementById('footer').innerHTML = footer;
}

// Save new post with POST request
function newPostSave() {
  let title = document.getElementById('new-post__title').value;
  let body = document.getElementById('new-post__body').value;
  let userId = document.getElementById('new-post__user-id').value;
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify({
      title: title,
      body: body,
      userId: userId
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
  .then(response => response.json())
  .then((json) => {
    // Display new post after saving
    const { id, title, body, userId } = json
    let result =
      `<h3 class="alert">your post has been saved</h3>
      <div class="post-view__post">
        <h1 class="post-view__title">${title}</h1>
        <p class="post-view__body">${body}</p>
        <p class="post-view__user-id">By: User #${userId}</p>
      </div>`
    document.getElementById('result').innerHTML = result;
    let footer =
      `<button class="cta cta--all-posts">&#8592; See All Posts</button>
      <button class="cta cta--new-post">Write Another Post</button>`
    document.getElementById('footer').innerHTML = footer;
  })
  .catch(error => console.error(error))
}

// 'Show All Posts' button
$(document).on('click', '.cta--all-posts', function(){
  fetchPosts('https://jsonplaceholder.typicode.com/posts?_page=1');
})

// 'New Post' button
$(document).on('click', '.cta--new-post', function(){
  newPost();
})

// Header click event
$(document).on('click', '.header', function(){
  fetchPosts('https://jsonplaceholder.typicode.com/posts?_page=1');
})

// Show individual post from post list
$(document).on('click', '.post-list__post', function(){
  var id = $(this).data('id');
  fetchOnePost(id);
})
