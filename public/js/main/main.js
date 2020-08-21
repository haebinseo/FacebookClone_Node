document.getElementById('newPostTabBtn')?.addEventListener('click', () => {
  document.getElementById('newPostTab').classList.remove('invisible');
});
document.getElementById('newPostCloseBtn')?.addEventListener('click', () => {
  document.getElementById('newPostTab').classList.add('invisible');
});

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

document.getElementById('postContent')?.addEventListener('input', (e) => {
  const postBtn = document.getElementById('postBtn');
  console.log(e.target.value, e.target.value.length);
  if (e.target.value.length > 0) {
    postBtn.disabled = false;
  } else {
    postBtn.disabled = true;
  }
});
