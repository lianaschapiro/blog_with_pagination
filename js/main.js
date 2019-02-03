const apiUrl = 'https://jsonplaceholder.typicode.com',
      footer = document.getElementById('footer'),
      result = document.getElementById('result');

init();

// ======================== FUNCTIONS ===========================

function init() {
  fetchUsers();
  fetchPosts(`${apiUrl}/posts?_page=1`);
}

// Get users from API
function fetchUsers() {
  fetch(`${apiUrl}/users`)
    .then(response => response.json())
    .then(json => {
      let users = {}
      json.forEach((user) => {
        const { id, name, username, email } = user
        users[id] = name
      })
      // Save user data to local storage to prevent repeat calls to the user endpoint
      localStorage.setItem('users', JSON.stringify(users));
    });
}

// Get all posts from API
function fetchPosts(url) {
  fetch(url)
    .then(response => {
      // Parse link response header into pagination URLs
      const linkHeaders = response.headers.get('Link').split(','),
            links       = {};
      for (let i=0; i<linkHeaders.length; i++) {
        const section = linkHeaders[i].split(';'),
              url     = section[0].replace(/<(.*)>/, '$1').trim(),
              name    = section[1].replace(/rel="(.*)"/, '$1').trim();
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
    .then(json => listPosts(json))
    .catch(error => console.error(error))
}

// List all posts
function listPosts(json) {
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
}

// Show individual post
function showPost(body, title, userName) {
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
    <button class="cta cta--new-post">New Post</button>`;
  footer.innerHTML = footerContent;
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
    </form>`;
  result.innerHTML = resultContent;
  let footerContent =
    `<button class="cta cta--all-posts">&#8592; See All Posts</button>`
  footer.innerHTML = footerContent;
}

// Save new post with POST request
function newPostSave() {
  const body   = document.getElementById('new-post__body').value,
        title  = document.getElementById('new-post__title').value,
        userId = document.getElementById('new-post__user-id').value;
  fetch(`${apiUrl}/posts`, {
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
  .then(json => newPostShow(json))
  .catch(error => console.error(error))
}

function newPostShow(json) {
  const { id, title, body, userId } = json,
        users  = JSON.parse(localStorage.getItem('users'));
  let resultContent =
    `<h3 class="alert">your post has been saved</h3>
    <div class="post-view__post">
      <h1 class="post-view__title">${title}</h1>
      <p class="post-view__body">${body}</p>
      <p class="post-view__user-id">By: ${users[userId]}</p>
    </div>`;
  result.innerHTML = resultContent;
  let footerContent =
    `<button class="cta cta--all-posts">&#8592; See All Posts</button>
    <button class="cta cta--new-post">Write Another Post</button>`;
  footer.innerHTML = footerContent;
}

// ==================== CLICK EVENTS ====================

// Header click event
document.getElementById('header').addEventListener("click", function(){
  fetchPosts(`${apiUrl}/posts?_page=1`);
})

// 'Show All Posts' button
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('cta--all-posts')) {
    fetchPosts(`${apiUrl}/posts?_page=1`);
  }
})

// 'New Post' button
document.getElementById('footer').addEventListener('click', function (event) {
  if (event.target.classList.contains('cta--new-post')) {
    newPost();
  }
})

// Show individual post from post list
document.getElementById('result').addEventListener('click', function (event) {
  const post = event.target.closest('.post-list__post')
  if (post != null){
  const body     = post.getElementsByClassName('post-list__body')[0].innerHTML,
        title    = post.getElementsByClassName('post-list__title')[0].innerHTML,
        userName = post.getAttribute('data-user-name');
  showPost(body, title, userName);
  }
})
