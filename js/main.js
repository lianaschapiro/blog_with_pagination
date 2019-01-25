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
