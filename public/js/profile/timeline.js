// 정보 수정 탭 토글
document.getElementById('accountInfoEditBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('profileEditTab').classList.remove('invisible');
});
function tabCloseEventHandler(e) {
  e.preventDefault();
  document.querySelector('body').classList.remove('noScroll');
  document.getElementById('profileEditTab').classList.add('invisible');
}
document
  .getElementById('profileEditCloseBtn')
  ?.addEventListener('click', tabCloseEventHandler);
document
  .getElementById('profileEditCancelBtn')
  ?.addEventListener('click', tabCloseEventHandler);

// 게시글 작성 탭 토글
document.getElementById('newPostTabBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('newPostTab').classList.remove('invisible');
  document.getElementById('postContent').focus();
});
document.getElementById('newPostCloseBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.remove('noScroll');
  document.getElementById('newPostTab').classList.add('invisible');
});

// 게시글 사진 upload
document.getElementById('photo')?.addEventListener('change', (e) => {
  const formData = new FormData();
  const { files } = e.target;
  // console.log(files);
  for (let i = 0; i < files.length; i += 1) {
    formData.append('photos', files[i], files[i].name);
  }

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const { photoIds, urls } = JSON.parse(xhr.responseText);
      document.getElementById('photoIds').value = photoIds.join();
      const preview = document.querySelector('.photo-preview');
      preview.classList.remove('invisible');
      for (let previewClone, i = 0; i < urls.length; i += 1) {
        previewClone = preview.cloneNode(true);
        preview.insertAdjacentElement('beforebegin', previewClone);
        previewClone.querySelector('img').src = urls[i];
      }
      preview.classList.add('invisible');
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('POST', '/photo');
  xhr.send(formData);
});

// 게시글 게시 버튼 활성화 적용
document.getElementById('postContent')?.addEventListener('input', (e) => {
  const postBtn = document.getElementById('postBtn');
  if (e.target.value.length > 0) {
    postBtn.disabled = false;
  } else {
    postBtn.disabled = true;
  }
});

// 댓글 들여쓰기
const comments = document.querySelectorAll('.commentItem');
comments.forEach((comment) => {
  comment.style.paddingLeft = `${50 * comment.dataset.depth}px`;
});

// 댓글 작성 이벤트 커스텀 핸들러
function commentPostHandler(e) {
  e.preventDefault();
  const formData = {
    content: e.target.children[0].children[1].children[0].children[0].value,
    pid: e.target.children[1].value,
    depth: e.target.children[2].value,
    bundleCreatedAt: e.target.children[3].value,
  };

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('POST', '/comment');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(formData));
}

// 댓글 작성 이벤트 커스텀
const commentForms = document.querySelectorAll('form[action="/comment"]');
commentForms.forEach((form) => form.addEventListener('submit', commentPostHandler));

// 좋아요
const likePostBtn = document.querySelectorAll('.likePostBtn');
likePostBtn.forEach((btn) => {
  btn.addEventListener('click', function () {
    const hasLiked = this.children[0].classList.contains('icon--liked');
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open(hasLiked ? 'DELETE' : 'POST', `/like/post/${this.dataset.pid}`);
    xhr.send();
  });
});

const likeCommentBtn = document.querySelectorAll('.likeCommentBtn');
likeCommentBtn.forEach((btn) => {
  btn.addEventListener('click', function () {
    const hasLiked = this.classList.contains('text-liked');
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open(hasLiked ? 'DELETE' : 'POST', `/like/comment/${this.dataset.cid}`);
    xhr.send();
  });
});

// 게시글의 코멘트 버튼 동작
const commentBtn = document.querySelectorAll('.commentBtn');
commentBtn.forEach((btn) => {
  btn.addEventListener('click', function () {
    const commentInput = this.parentNode.parentNode.querySelector('.commentContent');
    commentInput.focus();
  });
});

// 대댓글 버튼 클릭 시 댓글란 생성
const replyBtn = document.querySelectorAll('.replyBtn');
replyBtn.forEach((btn) => {
  btn.addEventListener('click', function () {
    const targetPlace = this.parentNode.parentNode.parentNode;
    const depth = 1;
    const { bundleCreatedAt } = this.dataset;

    let elem = this;
    while (!elem.classList.contains('commentSection')) {
      elem = elem.parentNode;
      if (elem.nodeName === 'BODY') {
        elem = null;
        return;
      }
    }
    const commentForm = elem.querySelector('form[action="/comment"]');
    const newForm = commentForm.cloneNode(true);
    targetPlace.insertAdjacentElement('afterend', newForm);
    newForm.addEventListener('submit', commentPostHandler);
    newForm.style.paddingLeft = '50px';

    const inputs = newForm.querySelectorAll('input');
    inputs[0].placeholder = '댓글 달기';
    inputs[2].value = depth; // depth
    inputs[3].value = bundleCreatedAt;

    inputs[0].focus();
  });
});

// 댓글 옵션 더보기 창 토글
const commentMoreBtns = document.querySelectorAll('.commentMoreBtn');
commentMoreBtns.forEach((btn) => {
  btn.addEventListener('click', function () {
    this.querySelector('.commentMoreTab').classList.toggle('invisible');
  });
  // 마우스가 해당 댓글 영역을 벗어날 때
  btn.parentNode.parentNode.addEventListener('mouseleave', function () {
    this.querySelector('.commentMoreTab').classList.add('invisible');
  });
});

// 댓글 수정 이벤트 핸들러
function commentEditEventHandler(e) {
  e.preventDefault();
  const form = e.target;
  const commentId = form.dataset.cid;
  const contentInput = form.querySelector('input[name="content"]');
  const data = { content: contentInput.value };
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('POST', `/comment/update/${commentId}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
}
// 댓글 수정 버튼 클릭시 댓글 수정란 생성 및 수정 이벤트 등록
const editCommentBtns = document.querySelectorAll('.editCommentBtn');
editCommentBtns.forEach((btn) => {
  btn.addEventListener('click', function () {
    let targetPlace = this;
    while (!targetPlace.classList.contains('commentItem')) {
      targetPlace = targetPlace.parentNode;
      if (targetPlace.nodeName === 'BODY') {
        targetPlace = null;
        return;
      }
    }
    let commentSection = targetPlace;
    while (!commentSection.classList.contains('commentSection')) {
      commentSection = commentSection.parentNode;
      if (commentSection.nodeName === 'BODY') {
        commentSection = null;
        return;
      }
    }

    const commentForm = commentSection.querySelector('form[action="/comment"]');
    const newForm = commentForm.cloneNode(true);
    newForm.setAttribute('data-cid', this.parentNode.dataset.cid);
    newForm.addEventListener('submit', commentEditEventHandler);
    newForm.style.paddingLeft = `${50 * targetPlace.dataset.depth}px`;
    const div = document.createElement('div');
    const a = document.createElement('a');
    const span = document.createElement('span');
    a.innerText = '취소';
    span.innerText = '하려면 Esc 키를 누르세요.';
    div.appendChild(a);
    div.appendChild(span);
    newForm.children[0].children[1].appendChild(div);
    targetPlace.insertAdjacentElement('afterend', newForm);

    const content = targetPlace.querySelector('.commentContent')?.innerText;
    const inputs = newForm.querySelectorAll('input');
    inputs[0].placeholder = content;
    inputs[0].value = content;
    inputs[2].value = targetPlace.dataset.depth;
    inputs[3].value = targetPlace.dataset.bundleCreatedAt;
    inputs[0].focus();

    // cancel commentEditEvent
    function commentEditCancelEventHandler(e) {
      if (e.type === 'click' || e.code === 'Escape') {
        targetPlace.classList.remove('invisible');
        document.removeEventListener('keydown', commentEditCancelEventHandler);
        newForm.remove();
      }
    }
    document.addEventListener('keydown', commentEditCancelEventHandler);
    a.addEventListener('click', commentEditCancelEventHandler);
    targetPlace.classList.add('invisible');
  });
});

// 댓글 삭제 이벤트
const deleteCommentBtn = document.querySelectorAll('.deleteCommentBtn');
deleteCommentBtn.forEach((btn) => {
  btn.addEventListener('click', function () {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    const commentId = this.parentNode.dataset.cid;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/comment/${commentId}`);
    xhr.send();
  });
});

// 친구 옵션 탭 토글
document.querySelectorAll('.friendBtn')?.forEach((bnt) => {
  bnt.addEventListener('click', function () {
    const tab = this.querySelector('.friendOptTab');
    tab.classList.toggle('invisible');
  });
});

// accountHoverTab invisible 토글
const isAccountHoverTabHovered = [];
document.querySelectorAll('.accountHoverTab')?.forEach((tab, idx) => {
  isAccountHoverTabHovered.push(false);
  tab.addEventListener('mouseenter', () => {
    isAccountHoverTabHovered[idx] = true;
  });
  tab.addEventListener('mouseleave', function () {
    isAccountHoverTabHovered[idx] = false;
    this.classList.add('invisible');
    this.querySelector('.friendOptTab')?.classList.add('invisible'); // 친구 탭 닫기
  });
});
document.querySelectorAll('.accountHoverTabTrigger')?.forEach((trigger, idx) => {
  const accountHoverTab = trigger.parentNode.parentNode.parentNode.querySelector(
    '.accountHoverTab',
  );
  const tabIdx = Math.floor(idx / 2);
  trigger.addEventListener('mouseenter', () => {
    accountHoverTab.classList.remove('invisible');
  });
  trigger.addEventListener('mouseleave', () => {
    setTimeout(() => {
      if (!isAccountHoverTabHovered[tabIdx]) {
        accountHoverTab.classList.add('invisible');
        accountHoverTab.querySelector('.friendOptTab')?.classList.add('invisible'); // 친구 탭 닫기
      }
    }, 100);
  });
});

// 친구 추가
document.querySelectorAll('.addFriendBtn')?.forEach((btn) =>
  btn.addEventListener('click', function () {
    const targetUID = this.dataset.uid;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('POST', `/friend/add/${targetUID}`);
    xhr.send();
  }),
);
// 친구 수락
document.querySelectorAll('.acceptFriendBtn')?.forEach((btn) =>
  btn.addEventListener('click', function () {
    const targetUID = this.dataset.uid;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('POST', `/friend/accept/${targetUID}`);
    xhr.send();
  }),
);
// 친구 끊기
document.querySelectorAll('.unfriendBtn')?.forEach((btn) => {
  btn.addEventListener('click', function () {
    const targetUID = this.dataset.uid;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/friend/remove/${targetUID}`);
    xhr.send();
  });
});
