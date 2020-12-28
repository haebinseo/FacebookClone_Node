// 게시글 작성 탭 토글
document.getElementById('newPostTabBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  const newPostTab = document.getElementById('newPostTab');
  newPostTab.classList.remove('invisible');
  newPostTab.querySelector('.postContent').focus();
});

// 댓글 작성 이벤트 커스텀 핸들러
function commentPostHandler(e) {
  e.preventDefault();
  const formElem = e.currentTarget;
  const {
    content: contentElem,
    postId: postIdElem,
    replyingId: replyingIdElem,
  } = formElem.elements;
  const formData = { content: contentElem.value };

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open(
    'POST',
    replyingIdElem
      ? `/post/${postIdElem.value}/comment/${replyingIdElem.value}`
      : `/post/${postIdElem.value}/comment`,
  );
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(formData));
}

// 댓글 작성 이벤트 커스텀
const commentForms = document.querySelectorAll('.commentForm');
commentForms.forEach((form) => form.addEventListener('submit', commentPostHandler));

// 좋아요
function likeEventHandler(e) {
  const { currentTarget } = e;
  const isPost = currentTarget.classList.item(0) === 'likePostBtn';
  const hasLiked = isPost
    ? currentTarget.children[0].classList.contains('icon--liked')
    : currentTarget.classList.contains('text-liked');
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201 || xhr.status === 204) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open(
    hasLiked ? 'DELETE' : 'POST',
    isPost
      ? `/post/${currentTarget.dataset.postId}/like`
      : `/post/${currentTarget.dataset.postId}/comment/${currentTarget.dataset.commentId}/like`,
  );
  xhr.send();
}
const likePostBtn = document.querySelectorAll('.likePostBtn');
likePostBtn.forEach((btn) => btn.addEventListener('click', likeEventHandler));
const likeCommentBtn = document.querySelectorAll('.likeCommentBtn');
likeCommentBtn.forEach((btn) => btn.addEventListener('click', likeEventHandler));

// 게시글의 코멘트 버튼 동작
const commentBtn = document.querySelectorAll('.commentBtn');
commentBtn.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const commentInput = currentTarget.parentNode.parentNode.querySelector(
      '.newCommentTab input[name="content"]',
    );
    commentInput.focus();
  });
});

// 대댓글 버튼 클릭 시 댓글란 생성
const replyBtn = document.querySelectorAll('.replyBtn');
replyBtn.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const { replyingId } = currentTarget.dataset;
    let targetPlace = currentTarget;
    while (!targetPlace.classList.contains('commentItem')) {
      targetPlace = targetPlace.parentNode;
      if (targetPlace.nodeName === 'BODY') {
        targetPlace = null;
        return;
      }
    }
    let elem = targetPlace;
    while (!elem.classList.contains('commentSection')) {
      elem = elem.parentNode;
      if (elem.nodeName === 'BODY') {
        elem = null;
        return;
      }
    }
    const commentForm = elem.querySelector('.commentForm');
    const newForm = commentForm.cloneNode(true);
    targetPlace.insertAdjacentElement('afterend', newForm);
    newForm.addEventListener('submit', commentPostHandler);
    newForm.style.paddingLeft = '50px';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'replyingId';
    input.value = replyingId;
    newForm.appendChild(input);
    newForm.elements.content.placeholder = '댓글 달기';
    newForm.elements.content.focus();
  });
});

// 댓글 옵션 더보기 창 토글
const commentMoreBtns = document.querySelectorAll('.commentMoreBtn');
commentMoreBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    currentTarget.querySelector('.commentMoreTab').classList.toggle('invisible');
  });
  // 마우스가 해당 댓글 영역을 벗어날 때
  btn.parentNode.parentNode.addEventListener('mouseleave', (e) => {
    const { currentTarget } = e;
    currentTarget.querySelector('.commentMoreTab').classList.add('invisible');
  });
});

// 댓글 수정 이벤트 핸들러
function commentEditEventHandler(e) {
  e.preventDefault();
  const form = e.target;
  const postId = form.elements.postId.value;
  const commentId = form.elements.commentId.value;
  const formData = { content: form.elements.content.value };
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 204) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('PATCH', `/post/${postId}/comment/${commentId}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(formData));
}
// 댓글 수정 버튼 클릭시 댓글 수정란 생성 및 수정 이벤트 등록
const editCommentBtns = document.querySelectorAll('.editCommentBtn');
editCommentBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    let targetPlace = currentTarget;
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

    const commentForm = commentSection.querySelector('.commentForm');
    const newForm = commentForm.cloneNode(true);
    newForm.addEventListener('submit', commentEditEventHandler);
    newForm.style.paddingLeft = `${50 * targetPlace.dataset.depth}px`;
    // 수정 중인 댓글의 id
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'commentId';
    input.value = currentTarget.parentNode.dataset.commentId;
    newForm.appendChild(input);
    // 취소 안내 문구 추가
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
    const contentElem = newForm.elements.content;
    contentElem.placeholder = content;
    contentElem.value = content;
    contentElem.focus();

    // cancel commentEditEvent
    // 댓글 수정 취소 이벤트 핸들러
    function commentEditCancelEventHandler(event) {
      if (event.type === 'click' || event.code === 'Escape') {
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
  btn.addEventListener('click', (e) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    const { currentTarget } = e;
    const { commentId, postId } = currentTarget.parentNode.dataset;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/post/${postId}/comment/${commentId}`);
    xhr.send();
  });
});

const accountHoverTabTriggers = document.querySelectorAll('.accountHoverTabTrigger');
const accountHoverTab = document.getElementById('accountHoverTab');

// accountHoverTab auto translate
function accountHoverTabTranslate() {
  const accountTriggerSelected = document.querySelector('.accountTriggerSelected');
  if (!accountTriggerSelected) return;

  const triggerCliRect = accountTriggerSelected.getBoundingClientRect();
  const tabCliRect = accountHoverTab.getBoundingClientRect();
  const scrolledY = window.pageYOffset;
  const sizeOfHeader = 60;
  const margin = 8;

  const translate = {
    x: triggerCliRect.x + (triggerCliRect.width - tabCliRect.width) / 2,
    y: triggerCliRect.y - tabCliRect.height,
  };

  if (translate.x < margin) {
    translate.x = margin;
  }
  if (translate.y < sizeOfHeader + margin) {
    translate.y = triggerCliRect.bottom;
  }
  translate.y += scrolledY;

  accountHoverTab.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
}

// event handler to make accountHoverTab visible/invisible
let tabApperingTimer;
let tabDisapperingTimer;
function setTabDisappearingTimer() {
  tabDisapperingTimer = setTimeout(() => {
    const accountTriggerSelected = document.querySelector('.accountTriggerSelected');
    if (accountTriggerSelected) return;
    // a cursor hasn't entered any trigger in 200ms after leave
    // and a cursor isn't hovering over the accountHoverTab
    accountHoverTab.classList.add('invisible');
  }, 200);
}
function updateAccountHoverTab(trigger) {
  trigger.classList.add('accountTriggerSelected');
  let dataElem = trigger;
  while (!dataElem.classList.contains('accountHoverTabData')) {
    dataElem = dataElem.parentNode;
    if (dataElem.nodeName === 'BODY') {
      dataElem = null;
      return;
    }
  }
  const userId =
    dataElem.dataset.postAuthorId || dataElem.dataset.commentAuthorId || dataElem.dataset.friendId;
  // ajax for checking friend relationship
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      accountHoverTab.querySelectorAll('a').forEach((a) => {
        a.href = `/profile/${userId}`;
      });
      accountHoverTab.querySelector('a>img').src = dataElem.querySelector(
        '.accountHoverTabTrigger>img',
      ).src;
      accountHoverTab.querySelector('a>span').innerText = dataElem.querySelector(
        '.accountHoverTabTrigger>span',
      ).innerText;
      accountHoverTab.children[1].setAttribute('data-user-id', userId);
      // make the correct accountHoverTab option div visible
      // -1: self, 0: stranger, 1: friend, 2: following, 3: followed
      for (let i = 0; i < 5; i += 1) {
        accountHoverTab.children[1].children[i].classList.add('invisible');
      }
      const { friendOption } = JSON.parse(xhr.responseText);
      switch (friendOption) {
        case -1:
          document.getElementById('myAHTab').classList.remove('invisible');
          break;
        case 0:
          document.getElementById('defaultAHTab').classList.remove('invisible');
          break;
        case 1:
          document.getElementById('friendAHTab').classList.remove('invisible');
          accountHoverTab.querySelector('.friendOptTab').classList.add('invisible');
          break;
        case 2:
          document.getElementById('friendAddedAHTab').classList.remove('invisible');
          break;
        case 3:
          document.getElementById('confirmAHTab').classList.remove('invisible');
          break;
        default:
          break;
      }

      // make accountHoverTab visible
      accountHoverTab.classList.remove('invisible');
      // relocate the tab along to the new trigger
      accountHoverTabTranslate();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('GET', `/user/friend/${userId}`);
  xhr.send();
}
accountHoverTabTriggers.forEach((trigger) => {
  trigger.addEventListener('mouseenter', (e) => {
    const { currentTarget } = e;
    if (accountHoverTab.classList.contains('invisible')) {
      // accountHoverTab 활성화 지연시간 500ms 설정
      tabApperingTimer = setTimeout(() => updateAccountHoverTab(currentTarget), 500);
    } else {
      // 이미 accountHoverTab이 활성화되어 있는 경우
      clearTimeout(tabDisapperingTimer); // cancel the timer for hiding accountHoverTab
      updateAccountHoverTab(currentTarget);
    }
  });

  trigger.addEventListener('mouseleave', (e) => {
    const { currentTarget } = e;
    if (accountHoverTab.classList.contains('invisible')) {
      clearTimeout(tabApperingTimer); // cancel the timer for appearing accountHoverTab
    } else {
      currentTarget.classList.remove('accountTriggerSelected');
      setTabDisappearingTimer(); // set a timer for hiding accountHoverTab automatically
    }
  });
});
accountHoverTab.addEventListener('mouseenter', () => {
  clearTimeout(tabDisapperingTimer); // cancel the timer for hiding accountHoverTab
});
accountHoverTab.addEventListener('mouseleave', () => {
  setTabDisappearingTimer(); // set a timer for hiding accountHoverTab automatically
});

// accountHoverTab 친구 옵션 탭 토글
accountHoverTab.querySelector('.friendOptBtn').addEventListener('click', () => {
  const tab = accountHoverTab.querySelector('.friendOptTab');
  tab.classList.toggle('invisible');
});

// 친구 옵션 창 외의 영역 클릭시 창 숨기기
accountHoverTab.addEventListener('click', (e) => {
  const tab = accountHoverTab.querySelector('.friendOptTab');
  if (tab.classList.contains('invisible')) return;

  let elem = e.target;
  while (!(elem.classList.contains('friendOptBtn') || elem.classList.contains('friendOptTab'))) {
    elem = elem.parentNode;
    if (elem.id === 'accountHoverTab') {
      elem = null;
      tab.classList.add('invisible');
      return;
    }
  }
});

// event handler about friend
function friendEventHandler(e) {
  const { currentTarget } = e;
  const targetUserId = document.querySelector('#accountHoverTab>div:nth-of-type(2)').dataset.userId;
  const isUnfriendBtn = currentTarget.classList.item(0) === 'unfriendBtn';
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201 || xhr.status === 204) {
      // window.location.reload();
      for (let i = 0; i < 4; i += 1) {
        accountHoverTab.children[1].children[i].classList.add('invisible');
      }
      document.getElementById('defaultAHTab').classList.remove('invisible');
      accountHoverTab.classList.add('invisible');
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open(isUnfriendBtn ? 'DELETE' : 'POST', `/user/friend/${targetUserId}`);
  xhr.send();
}
// add friend
// 친구 추가
accountHoverTab.querySelector('.addFriendBtn')?.addEventListener('click', friendEventHandler);
// confirm friend
// 친구 수락
accountHoverTab.querySelector('.acceptFriendBtn')?.addEventListener('click', friendEventHandler);
// cancel friend request
// 친구 요청 취소
// accountHoverTab.querySelector('.friendRequestedBtn')?.addEventListener('click', friendEventHandler);
// delete friend
// 친구 끊기
accountHoverTab.querySelector('.unfriendBtn').addEventListener('click', friendEventHandler);

// event handlers and functions related to postMoreTab
const postMoreBtns = document.querySelectorAll('.postMoreBtn');
const postMoreTab = document.getElementById('postMoreTab');
const postMoreList = postMoreTab?.querySelector('.postMoreList');
const triangle = postMoreTab?.querySelector('.triangle');

function fillPostMoreTabData() {
  const postSelected = document.querySelector('.postSelected');
  postMoreList.setAttribute('data-post-id', postSelected.dataset.postId);
}

function translatePostMoreTab() {
  const postSelected = document.querySelector('.postSelected');
  if (!postSelected) return;

  const btnCliRect = postSelected.getBoundingClientRect();
  const listCliRect = postMoreList.getBoundingClientRect();
  const scrolledY = window.pageYOffset;
  const margin = 24;
  const halfSizeOfBtn = btnCliRect.height / 2;
  const gapBtnTab = 12; // gap between a button and tab
  const gapBtnTri = 7; // gap between a button and triangle

  const transform = {
    tab: { x: btnCliRect.right, y: scrolledY + btnCliRect.y + halfSizeOfBtn },
    list: { x: -listCliRect.width, y: halfSizeOfBtn + gapBtnTab },
    tri: { x: -24, y: halfSizeOfBtn + gapBtnTri, deg: -45 },
  };

  if (window.innerHeight < btnCliRect.bottom + gapBtnTab + listCliRect.height + margin) {
    // the photoOptList overflows the window vertically
    transform.list.y = -listCliRect.height - gapBtnTab - halfSizeOfBtn;
    transform.tri.y = -halfSizeOfBtn - gapBtnTri - gapBtnTab;
    transform.tri.deg = 135;
  }
  postMoreTab.style.transform = `translate(${transform.tab.x}px, ${transform.tab.y}px)`;
  postMoreList.style.transform = `translate(${transform.list.x}px, ${transform.list.y}px)`;
  triangle.style.transform = `translate(${transform.tri.x}px, ${transform.tri.y}px)  rotate(${transform.tri.deg}deg)`;
}

// postMoreBtn click event
postMoreBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const postSelected = document.querySelector('.postSelected');
    if (postSelected) {
      // a postMoreBtn is already clicked
      if (postSelected.isSameNode(currentTarget)) {
        // same button is clicked twice
        currentTarget.classList.remove('postSelected');
        postMoreTab.classList.add('invisible');
        return;
      }
      postSelected.classList.remove('postSelected');
    }

    currentTarget.classList.add('postSelected');
    postMoreTab.classList.remove('invisible');
    fillPostMoreTabData();
    translatePostMoreTab();
  });
});

// postMoreTab auto translation when window is resized or scrolled
window.addEventListener('resize', translatePostMoreTab);
window.addEventListener('scroll', translatePostMoreTab);

// hide postMoreTab when outside of button and tab is clicked
function deselectPostMoreBtn() {
  const postSelected = document.querySelector('.postSelected');
  postSelected.classList.remove('postSelected');
  postMoreTab.classList.add('invisible');
}
document.querySelector('body').addEventListener('click', (e) => {
  // postMoreTab이 비활성화시 종료
  if (!postMoreTab || postMoreTab.classList.contains('invisible')) return;

  let elem = e.target;
  while (!(elem.classList.contains('postMoreBtn') || elem.id === 'postMoreTab')) {
    elem = elem.parentNode;
    if (elem.nodeName === 'BODY') {
      elem = null;
      deselectPostMoreBtn();
      return;
    }
  }
});

// add removing post event handler
// postMoreTab의 게시글 삭제 이벤트 추가
postMoreTab?.querySelector('.removePostBtn').addEventListener('click', () => {
  const { postId } = postMoreList.dataset;

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 204) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('DELETE', `/post/${postId}`);
  xhr.send();
});

// event handlers and functions related to editPostTab
const editPostTab = document.getElementById('editPostTab');
const postContentToEdit = editPostTab?.querySelector('textarea.postContent');

// 게시글 작성 textarea auto resizing
function textareaResizeHandler() {
  const targetStyle = postContentToEdit.style;
  if (postContentToEdit.textLength > 60) {
    if (targetStyle.fontSize !== '15px') targetStyle.fontSize = '15px';
  } else if (targetStyle.fontSize !== '24px') {
    targetStyle.fontSize = '24px';
  }

  targetStyle.height = '40px'; // shrink the textarea if it is empty
  targetStyle.height = `${postContentToEdit.scrollHeight + 40}px`;
}
postContentToEdit?.addEventListener('keydown', textareaResizeHandler);
postContentToEdit?.addEventListener('keyup', textareaResizeHandler);

// 게시글 게시 버튼 활성화 적용
function checkAndUpdatePostBtn(e) {
  const photoIds = editPostTab.querySelector('.photoIds');
  const editBtn = editPostTab.querySelector('#editBtn');
  if (postContentToEdit.value.length || photoIds.value.length) editBtn.disabled = false;
  else editBtn.disabled = true;
}
postContentToEdit?.addEventListener('input', checkAndUpdatePostBtn);

// 게시글 이미지 upload 취소
function photoRemoveEventHandler(e) {
  let elem = e.target;
  while (!elem.classList.contains('photoPreview')) {
    elem = elem.parentNode;
    if (elem.nodeName === 'BODY') {
      elem = null;
      return;
    }
  }
  // except the photo id from the array fo photoIds
  const photoIdsInput = editPostTab.querySelector('.photoIds');
  const photoIds = photoIdsInput.value.split(',');
  // console.log('typeof elem.dataset.pid', typeof elem.dataset.pid);
  photoIdsInput.value = photoIds.filter((id) => id !== elem.dataset.photoId).join();
  // remove the photo preview
  elem.remove();
  // check the activation condition of the post button
  checkAndUpdatePostBtn();
}
const photoRemoveBtns = editPostTab?.querySelectorAll('.photoRemoveBtn');
photoRemoveBtns?.forEach((btn) => btn.addEventListener('click', photoRemoveEventHandler));

// 게시글 이미지 upload
editPostTab?.querySelector('.photos').addEventListener('change', (e) => {
  const formData = new FormData();
  const { files } = e.target;
  // console.log(files);
  for (let i = 0; i < files.length; i += 1) {
    formData.append('photos', files[i], files[i].name);
  }

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201) {
      const { photoIds, urls } = JSON.parse(xhr.responseText);
      // add new photoIds to Input for photoIds
      const photoIdsInput = editPostTab.querySelector('.photoIds');
      photoIdsInput.value += photoIdsInput.value === '' ? photoIds.join() : `,${photoIds.join()}`;
      // add previews for new photos
      const photoPreviewArea = editPostTab.querySelector('.photoPreviewArea');
      for (let i = 0; i < urls.length; i += 1) {
        const preview = document.createElement('div');
        preview.classList.add('photoPreview');
        preview.setAttribute('data-photo-id', photoIds[i]);
        preview.innerHTML = `
        <div>
          <img src="${urls[i]}" alt="미리보기">
          <div class="photoRemoveBtn">
            <i></i>
            <div></div>
          </div>
        </div>`;
        photoPreviewArea.appendChild(preview);
        preview.querySelector('.photoRemoveBtn').addEventListener('click', photoRemoveEventHandler);
      }

      // check the activation condition of the post button
      checkAndUpdatePostBtn();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('POST', '/photo');
  xhr.send(formData);
});

// edit the post
// 게시글 수정
editPostTab?.querySelector('form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const formElem = e.currentTarget;
  const { postId } = formElem.dataset;
  const formData = {
    content: formElem.elements.content.value,
    photoIds: formElem.elements.photoIds.value || null,
  };

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 204) document.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('PATCH', `/post/${postId}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(formData));
});

// 수정하고자 하는 게시글 내용으로 editPostTab 채우기
function fillEditPostTabData(post) {
  // post id
  editPostTab.querySelector('form').setAttribute('data-post-id', post.id);
  // content
  postContentToEdit.value = post.content;
  if (!post.photos.length) return;

  // photo ids
  const photoIdsInput = editPostTab.querySelector('.photoIds');
  photoIdsInput.value = post.photos.map((p) => p.id).join();
  // photo previews
  const photoPreviewArea = editPostTab.querySelector('.photoPreviewArea');
  for (let i = 0; i < post.photos.length; i += 1) {
    const preview = document.createElement('div');
    preview.classList.add('photoPreview');
    preview.setAttribute('data-photo-id', post.photos[i].id);
    preview.innerHTML = `
    <div>
      <img src="${post.photos[i].url}" alt="미리보기">
      <div class="photoRemoveBtn">
        <i></i>
        <div></div>
      </div>
    </div>`;
    photoPreviewArea.appendChild(preview);
    preview.querySelector('.photoRemoveBtn').addEventListener('click', photoRemoveEventHandler);
  }
}
// editPostTab 드러내기
function displayEditPostTab() {
  document.querySelector('body').classList.add('noScroll');
  editPostTab.classList.remove('invisible');
  textareaResizeHandler();
  postContentToEdit.focus();
}
// editPostTab 숨기기
function hideEditPostTab() {
  document.querySelector('body').classList.remove('noScroll');
  editPostTab.classList.add('invisible');
  editPostTab.querySelector('#editPostResetBtn').click(); // reset the form
  postContentToEdit.style.fontSize = '24px';
  const previews = editPostTab.querySelectorAll('.photoPreview');
  previews.forEach((p) => p.remove());
}

document.getElementById('editPostCloseBtn')?.addEventListener('click', hideEditPostTab);
document.querySelector('#editPostTab>div')?.addEventListener('click', hideEditPostTab);
postMoreTab?.querySelector('.editPostBtn').addEventListener('click', () => {
  // fetch the post to edit
  const { postId } = postMoreList.dataset;

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      const { postToEdit } = JSON.parse(xhr.responseText);
      fillEditPostTabData(postToEdit);
      deselectPostMoreBtn();
      displayEditPostTab();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('GET', `/post/${postId}`);
  xhr.send();
});
