window.onload = function() {
  const footer = document.getElementById('footer'),
        result = document.getElementById('result');

  // Header click event
  document.getElementById('header').addEventListener("click", function(){
    fetchPosts('https://jsonplaceholder.typicode.com/posts?_page=1');
  })

  fetchUsers();
  fetchPosts('https://jsonplaceholder.typicode.com/posts?_page=1');
}

function fetchUsers() {
  console.log('fetch users')
  fetch('https://jsonplaceholder.typicode.com/users')
    .then(response => response.json())
    .then((json) => {
      let users = {}
      json.forEach((user) => {
        const { id, name, username, email } = user
        users[id] = name
      })
      // Save user data to local storage to prevent repeat calls to the user endpoint
      localStorage.setItem('users', JSON.stringify(users));
    });
}

// Fetch and list all posts
function fetchPosts(url) {
  fetch(url)
    .then(response => {
      // Parse link header from response into pagination URLs
      var url;
      var linkHeaders = response.headers.get('Link').split(',');
      var links = {};
      for (var i=0; i<linkHeaders.length; i++) {
        var section = linkHeaders[i].split(';');
        var url = section[0].replace(/<(.*)>/, '$1').trim();
        var name = section[1].replace(/rel="(.*)"/, '$1').trim();
        links[name] = url;
      }
      // Populate footer with pagination buttons
      let footerContent = ''
      if (links.prev != undefined) {
        footerContent +=
          `<button class="cta" onclick="fetchPosts('${links.prev}')">Previous Posts</button>`
      }
      if (links.next != undefined) {
        footerContent +=
          `<button class="cta" onclick="fetchPosts('${links.next}')">Next Posts</button>`
      }
      footer.innerHTML = footerContent;
      return response.json()
    })
    // Manipulate JSON response data
    .then((json) => {
      const users  = JSON.parse(localStorage.getItem('users'))
      let resultContent = ''
      json.forEach((post) => {
        const { id, title, body, userId } = post
        resultContent +=
          `<div class="post-list__post" data-id="${id}" data-user-name="${users[userId]}">
            <h3 class="post-list__title">${title}</h3>
            <p class="post-list__body">${body}</p>
            <p class="post-list__author">By: ${users[userId]}</p>
          </div>`;
      })
      result.innerHTML = resultContent;
    })
    .catch(error => console.error(error))
}

// Show individual post
function fetchOnePost(id, userName) {
  fetch('https://jsonplaceholder.typicode.com/posts/'+id+'')
    .then(response => {return response.json() })
    .then((json) => {
      const { id, title, body, userId } = json
      let resultContent =
        `<div class="post-view__post">
          <img class="post-view__img" src="http://lorempixel.com/640/360">
          <h2 class="post-view__title">${title}</h2>
          <p class="post-view__body">${body}</p>
          <p class="post-view__user-id">By: ${userName}</p>
        </div>`;
      result.innerHTML = resultContent;
      let footerContent =
        `<button class="cta cta--all-posts">&#8592; See All Posts</button>
        <button class="cta cta--new-post">New Post</button>`
      footer.innerHTML = footerContent;
    })
    .catch(error => console.error(error))
}

// Form to create a new post
function newPost() {
  let resultContent =
    `<form id="new-post__form" action="javascript:void(0);" onsubmit="newPostSave()">
      <label for="new-post__title">Title:</label>
      <input required type="text" id="new-post__title" name="new-post__title">
      <label for="body">Body:</label>
      <textarea required id="new-post__body" name="new-post__body"></textarea>
      <label for="new-post__user-id">Your User ID:</label>
      <input required type="number" min="1" max="10" id="new-post__user-id" name="new-post__user-id">
      <input id="new-post__submit" class="cta" type="submit" value="Submit">
    </form>`
  result.innerHTML = resultContent;
  let footerContent =
    `<button class="cta cta--all-posts">&#8592; See All Posts</button>`
  footer.innerHTML = footerContent;
}

// Save new post with POST request
function newPostSave() {
  const body   = document.getElementById('new-post__body').value,
        title  = document.getElementById('new-post__title').value,
        users  = JSON.parse(localStorage.getItem('users')),
        userId = document.getElementById('new-post__user-id').value;
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
    let resultContent =
      `<h3 class="alert">your post has been saved</h3>
      <div class="post-view__post">
        <h1 class="post-view__title">${title}</h1>
        <p class="post-view__body">${body}</p>
        <p class="post-view__user-id">By: ${users[userId]}</p>
      </div>`
    result.innerHTML = resultContent;
    let footerContent =
      `<button class="cta cta--all-posts">&#8592; See All Posts</button>
      <button class="cta cta--new-post">Write Another Post</button>`
    footer.innerHTML = footerContent;
  })
  .catch(error => console.error(error))
}

// ===== Click events for dynamically-created elements =====

// 'Show All Posts' button
$(document).on('click', '.cta--all-posts', function(){
  fetchPosts('https://jsonplaceholder.typicode.com/posts?_page=1');
})

// 'New Post' button
$(document).on('click', '.cta--new-post', function(){
  newPost();
})

// Show individual post from post list
$(document).on('click', '.post-list__post', function(){
  var id = $(this).data('id');
  var userName = $(this).data('user-name');
  fetchOnePost(id, userName);
})

