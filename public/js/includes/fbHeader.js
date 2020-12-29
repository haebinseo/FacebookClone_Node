// hashtag 자동 완성
function showHashtagsAutoCompleted(hashtags) {
  const hashtagTab = document.getElementById('hashtagTab');
  hashtagTab.children[0].remove();
  hashtagTab.classList.remove('invisible');
  const ul = document.createElement('ul');
  let list;
  console.log('hashtags: ', hashtags, typeof hashtags);
  hashtags.forEach((tag) => {
    list = document.createElement('li');
    list.innerText = tag;
    // 자동완성된 hashtag click event
    list.addEventListener('click', () => {
      window.location.href = `/search/post/hashtag?hashtag=${tag}`;
    });
    ul.appendChild(list);
  });
  hashtagTab.append(ul);
}
function getHashtagsAutoCompleted(hashtag) {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) showHashtagsAutoCompleted(JSON.parse(xhr.responseText));
    else console.error(xhr.responseText);
  };
  xhr.open('GET', `/search/hashtag?hashtag=${hashtag}`);
  xhr.send();
}
let timer;
const hashtagInput = document.getElementById('hashtagInput');
hashtagInput?.addEventListener('input', (e) => {
  const hashtag = e.currentTarget.value;
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (hashtag) getHashtagsAutoCompleted(hashtag);
  }, 500);
});

// set isRead of alarm true
// 알람의 읽음 속성값 true로 설정
function removeUnread() {
  const unreadAlarmCount = document.getElementById('unreadAlarmCount');
  unreadAlarmCount.classList.add('invisible');
  const unreadAlarms = document.querySelectorAll('.unread');
  if (!unreadAlarms.length) return;

  const unreadAlarmIds = Array.from(unreadAlarms).map((alarm) => alarm.dataset.alarmId);
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 204) {
      // remove unread class from div
      unreadAlarms.forEach((alarm) => alarm.classList.remove('unread'));
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('PATCH', '/user/alarms');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ unreadAlarmIds }));
}

// make the createTab visible/invisible
// 생성창 보이기/숨기기
document.getElementById('create')?.addEventListener('click', () => {
  document.getElementById('createTab')?.classList.toggle('invisible');
});

// make the alarmTab visible/invisible
// 알람창 보이기/숨기기
document.getElementById('alarm')?.addEventListener('click', () => {
  const alarmTab = document.getElementById('alarmTab');
  if (alarmTab.classList.contains('invisible')) {
    alarmTab.classList.remove('invisible');
  } else {
    alarmTab.classList.add('invisible');
    removeUnread();
  }
});

// make the accountTab visible/invisible
// 계정창 보이기/숨기기
document.getElementById('account')?.addEventListener('click', () => {
  document.getElementById('accountTab')?.classList.toggle('invisible');
});

// hide the accountTab, createTab, alarmTab, hashtagTab when outside of button and tab is clicked
// 해당 창(생성, 계정, 알림, 해시태그) 외의 영역 클릭 및 esc 입력시 창 숨기기
const targetIds = [
  { btn: 'account', tab: 'accountTab' },
  { btn: 'create', tab: 'createTab' },
  { btn: 'alarm', tab: 'alarmTab' },
  { btn: 'hashtagForm', tab: 'hashtagTab' },
];
function hideTabs(e) {
  for (let i = 0; i < targetIds.length; i += 1) {
    const tab = document.getElementById(targetIds[i].tab);
    if (tab && !tab.classList.contains('invisible')) {
      if (e.type === 'click') {
        let elem = e.target;
        while (!(elem.id === targetIds[i].btn || elem.id === targetIds[i].tab)) {
          elem = elem.parentNode;
          if (elem.nodeName === 'BODY') {
            elem = null;
            tab.classList.add('invisible');
            if (targetIds[i].tab === 'alarmTab') removeUnread();
            return;
          }
        }
      } else if (e.code === 'Escape') {
        tab.classList.add('invisible');
      }
    }
  }
}
document.querySelector('body').addEventListener('click', hideTabs);
document.addEventListener('keyup', hideTabs);

// alarmTab confirm/deleteFriendBtn click event
// 알림 창에서 친구 신청 수락 및 거절 이벤트 처리
function friendEventHandler(e) {
  const { currentTarget } = e;
  const targetUserId = currentTarget.parentNode.dataset.senderId;
  const isConfirmBtn = currentTarget.classList.item(0) === 'confirmFriendBtn';
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201 || xhr.status === 204) {
      // change time text to result message and remove buttons
      currentTarget.parentNode.parentNode.children[1].innerText = `요청이 ${
        isConfirmBtn ? '수락' : '거절'
      }되었습니다.`;
      currentTarget.parentNode.parentNode.classList.remove('unread');
      currentTarget.parentNode.remove();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open(isConfirmBtn ? 'POST' : 'DELETE', `/user/friend/${targetUserId}`);
  xhr.send();
}

const confirmFriendBtns = document.querySelectorAll('.confirmFriendBtn');
const deleteFriendBtns = document.querySelectorAll('.deleteFriendBtn');
confirmFriendBtns.forEach((btn) => btn.addEventListener('click', friendEventHandler));
deleteFriendBtns.forEach((btn) => btn.addEventListener('click', friendEventHandler));

// logout
document.getElementById('logout')?.addEventListener('click', (e) => {
  const { currentTarget } = e;
  currentTarget.submit();
});

// event handlers and functions related to newPostTab
const createTab = document.getElementById('createTab');
const newPostTab = document.getElementById('newPostTab');
const newPostContent = newPostTab.querySelector('textarea.postContent');

// 게시글 작성 textarea auto resizing
function textareaResizeHandler(e) {
  const targetStyle = e.target.style;
  if (e.target.textLength > 60) {
    if (targetStyle.fontSize !== '15px') targetStyle.fontSize = '15px';
  } else if (targetStyle.fontSize !== '24px') {
    targetStyle.fontSize = '24px';
  }

  targetStyle.height = '40px'; // shrink the textarea if it is empty
  targetStyle.height = `${e.target.scrollHeight + 40}px`;
}
newPostContent.addEventListener('keydown', textareaResizeHandler);
newPostContent.addEventListener('keyup', textareaResizeHandler);

// 게시글 게시 버튼 활성화 적용
function checkAndUpdatePostBtn() {
  const photoIds = newPostTab.querySelector('.photoIds');
  const postBtn = newPostTab.querySelector('#postBtn');
  if (newPostContent.value.length || photoIds.value.length) postBtn.disabled = false;
  else postBtn.disabled = true;
}
newPostContent.addEventListener('input', checkAndUpdatePostBtn);

// 게시글 이미지 upload 취소
function deletePhoto(photoId) {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status !== 204) console.error(xhr.responseText);
  };
  xhr.open('DELETE', `/photo/${photoId}`);
  xhr.send();
}

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
  const photoIdToRemove = elem.dataset.photoId;
  const photoIdsInput = newPostTab.querySelector('.photoIds');
  const photoIds = photoIdsInput.value.split(',');
  // console.log('typeof elem.dataset.pid', typeof elem.dataset.pid);
  photoIdsInput.value = photoIds.filter((id) => id !== photoIdToRemove).join();
  // remove the photo preview
  elem.remove();
  // delete the photo from the database
  deletePhoto(photoIdToRemove);
  // check the activation condition of the post button
  checkAndUpdatePostBtn();
}

// 게시글 이미지 upload
function updatePhotoPreviews(photoIds, urls) {
  // add new photoIds to Input for photoIds
  const photoIdsInput = newPostTab.querySelector('.photoIds');
  photoIdsInput.value += photoIdsInput.value === '' ? photoIds.join() : `,${photoIds.join()}`;
  // add previews for new photos
  const photoPreviewArea = newPostTab.querySelector('.photoPreviewArea');
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
}
function photoUploadEventHandler(e) {
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
      updatePhotoPreviews(photoIds, urls);
      // check the activation condition of the post button
      checkAndUpdatePostBtn();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('POST', '/photo');
  xhr.send(formData);
}
newPostTab.querySelector('input.photos').addEventListener('change', photoUploadEventHandler);

// make newPostTab visible/invisible
// 게시글 작성창 보이기/숨기기
function displayNewPostTab() {
  createTab.classList.add('invisible');
  document.querySelector('body').classList.add('noScrollByHeader');
  newPostTab.classList.remove('invisible');
  newPostContent.focus();
}
function hideNewPostTab() {
  document.querySelector('body').classList.remove('noScrollByHeader');
  newPostTab.classList.add('invisible');
  newPostTab.querySelector('#newPostResetBtn').click(); // reset the form
  newPostContent.style.fontSize = '24px';
  const previews = newPostTab.querySelectorAll('.photoPreview');
  previews.forEach((p) => {
    deletePhoto(p.dataset.photoId); // delete photo from database
    p.remove(); // delete preview element
  });
}
document.getElementById('createPostBtn').addEventListener('click', displayNewPostTab);
document.getElementById('newPostCloseBtn').addEventListener('click', hideNewPostTab);
document.querySelector('#newPostTab>div').addEventListener('click', hideNewPostTab);
document.addEventListener('keyup', (e) => {
  if (!newPostTab.classList.contains('invisible') && e.code === 'Escape') hideNewPostTab();
});

// post a new post
// 게시글 작성
newPostTab.querySelector('form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const formElem = e.currentTarget;
  const formData = {
    content: formElem.elements.content.value,
    photoIds: formElem.elements.photoIds.value || null,
  };

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201) document.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('POST', '/post');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(formData));
});

// user socket event handler
const alarmContent = {
  like: '님이 좋아요을 눌렀습니다.',
  comment: '님이 댓글을 달았습니다.',
  confirmFriend: '님이 친구 요청을 보냈습니다.',
  friendConfirmed: '님이 친구 요청을 수락했습니다.',
};

function updateAlarmCount() {
  const unreadAlarmCount = document.getElementById('unreadAlarmCount');

  if (unreadAlarmCount.classList.contains('invisible')) {
    unreadAlarmCount.innerText = 1;
    unreadAlarmCount.classList.remove('invisible');
  } else {
    unreadAlarmCount.innerText = 1 + parseInt(unreadAlarmCount.innerText, 10);
  }
}

function updateAlarmTab(alarm) {
  const alarmTab = document.getElementById('alarmTab');
  const noAlarm = document.getElementById('noAlarm');
  if (noAlarm) noAlarm.remove();

  const alarmDiv = document.createElement('div');
  alarmDiv.classList.add('alarm');
  // timeText
  const timeDiff = (new Date() - new Date(alarm.createdAt)) / 60000; // min diff
  const dayDiff = timeDiff / 1440; // day diff
  let timeText;
  if (dayDiff < 1) {
    if (timeDiff < 1) timeText = '방금 전';
    else if (timeDiff < 60) timeText = `${Math.floor(timeDiff)}분 전`;
    else timeText = `${Math.floor(timeDiff / 60)}시간 전`;
  } else if (dayDiff < 7) {
    timeText = `${Math.floor(dayDiff)}일 전`;
  } else {
    timeText = `${Math.floor(dayDiff / 7)}주 전`;
  }
  alarmDiv.innerHTML = `
  <div>
    <img src=${alarm.Sender.profilePhoto} alt="">
  </div>
  <div ${alarm.isRead ? '' : 'class="unread" '}data-alarm-id=${alarm.id}>
    <span> 
      <span>${alarm.Sender.name}</span>${alarmContent[alarm.type]}
    </span>
    <span>${timeText}</span>
    ${
      alarm.type === 'confirmFriend'
        ? `<div data-sender-id=${alarm.Sender.id}>
          <div class="confirmFriendBtn">확인</div>
          <div class="deleteFriendBtn">삭제</div>
        </div>`
        : ''
    }
  </div>
  <div></div>
  `;
  if (alarm.type === 'confirmFriend') {
    // attach event handler
    alarmDiv.querySelector('.confirmFriendBtn').addEventListener('click', friendEventHandler);
    alarmDiv.querySelector('.deleteFriendBtn').addEventListener('click', friendEventHandler);
  }

  // update unreadAlarmCount
  updateAlarmCount();

  alarmTab.children[1].insertAdjacentElement('afterbegin', alarmDiv);
}

function updateMessageCount() {
  const unreadMessageCount = document.getElementById('unreadMessageCount');

  if (unreadMessageCount.classList.contains('invisible')) {
    unreadMessageCount.innerText = 1;
    unreadMessageCount.classList.remove('invisible');
  } else {
    unreadMessageCount.innerText = 1 + parseInt(unreadMessageCount.innerText, 10);
  }
}

export { displayNewPostTab, photoUploadEventHandler, updateAlarmTab, updateMessageCount };
