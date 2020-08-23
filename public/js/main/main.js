// 게시글 작성 탭 토글
document.getElementById('newPostTabBtn')?.addEventListener('click', () => {
  document.getElementById('newPostTab').classList.remove('invisible');
});
document.getElementById('newPostCloseBtn')?.addEventListener('click', () => {
  document.getElementById('newPostTab').classList.add('invisible');
});

// 게시글 이미지 upload
document.getElementById('img')?.addEventListener('change', (e) => {
  const formData = new FormData();
  const { files } = e.target;
  console.log(files);
  formData.append('image', files[0]);
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const { url } = JSON.parse(xhr.responseText);
      document.getElementById('img-url').value = url;
      document.getElementById('img-preview').src = url;
      document.getElementById('img-preview').style.display = 'inline';
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('POST', '/post/img');
  xhr.send(formData);
});

// 게시글 게시 버튼 활성화 적용
document.getElementById('postContent')?.addEventListener('input', (e) => {
  const postBtn = document.getElementById('postBtn');
  console.log(e.target.value, e.target.value.length);
  if (e.target.value.length > 0) {
    postBtn.disabled = false;
  } else {
    postBtn.disabled = true;
  }
});

// 댓글 들여쓰기
const comments = document.querySelectorAll('.commentItem');
comments.forEach((comment) => {
  comment.style.paddingLeft = `${5 * comment.dataset.depth}px`;
});

// 댓글 작성 이벤트 커스텀
const commentForms = document.querySelectorAll('form[action="/comment"]');
commentForms.forEach((form) =>
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      content: e.target.children[0].children[1].children[0].value,
      pid: e.target.children[1].value,
      depth: e.target.children[2].value,
      bundleCreatedAt: e.target.children[3].value,
    };
    let urlEncodedData = '';
    const urlEncodedDataPairs = [];

    // Turn the data object into an array of URL-encoded key/value pairs.
    Object.entries(formData).forEach(([key, value]) => {
      urlEncodedDataPairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });

    // Combine the pairs into a single string and replace all %-encoded spaces to
    // the '+' character; matches the behaviour of browser form submissions.
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('POST', '/comment');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(urlEncodedData);
  }),
);
