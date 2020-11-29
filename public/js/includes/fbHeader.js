// set isRead of alarm true
function removeUnread() {
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
document.getElementById('create')?.addEventListener('click', () => {
  document.getElementById('createTab')?.classList.toggle('invisible');
});

// make the alarmTab visible/invisible
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
document.getElementById('account')?.addEventListener('click', () => {
  document.getElementById('accountTab')?.classList.toggle('invisible');
});

// hide the accountTab, createTab, alarmTab when outside of button and tab is clicked
document.querySelector('body').addEventListener('click', (e) => {
  const targetIds = [
    { btn: 'account', tab: 'accountTab' },
    { btn: 'create', tab: 'createTab' },
    { btn: 'alarm', tab: 'alarmTab' },
  ];
  for (let i = 0; i < targetIds.length; i += 1) {
    const tab = document.getElementById(targetIds[i].tab);
    if (!tab.classList.contains('invisible')) {
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
    }
  }
});

// alarmTab confirm/deleteFriendBtn click event
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

// make newPostTab visible/invisible
function displayNewPostTab() {
  document.getElementById('createTab').classList.add('invisible');
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('newPostTab').classList.remove('invisible');
  document.getElementById('postContent').focus();
}
function hideNewPostTab() {
  document.querySelector('body').classList.remove('noScroll');
  document.getElementById('newPostTab').classList.add('invisible');
  document.getElementById('newPostResetBtn').click(); // reset the form
  document.getElementById('postContent').style.fontSize = '24px';
  const previews = document.querySelectorAll('.photo-preview:not(.invisible)');
  previews.forEach((p) => p.remove());
}
document.getElementById('createPostBtn')?.addEventListener('click', displayNewPostTab);
document.getElementById('newPostCloseBtn')?.addEventListener('click', hideNewPostTab);
document.querySelector('#newPostTab>div')?.addEventListener('click', hideNewPostTab);

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
document.getElementById('postContent').addEventListener('keydown', textareaResizeHandler);
document.getElementById('postContent').addEventListener('keyup', textareaResizeHandler);

// 게시글 게시 버튼 활성화 적용
function checkAndUpdatePostBtn() {
  const postContent = document.getElementById('postContent');
  const photoIds = document.getElementById('photoIds');
  const postBtn = document.getElementById('postBtn');
  if (postContent.value.length || photoIds.value.length) postBtn.disabled = false;
  else postBtn.disabled = true;
}
document.getElementById('postContent')?.addEventListener('input', checkAndUpdatePostBtn);

// 게시글 이미지 upload 취소
function photoRemoveEventHandler(e) {
  let elem = e.target;
  while (!elem.classList.contains('photo-preview')) {
    elem = elem.parentNode;
    if (elem.nodeName === 'BODY') {
      elem = null;
      return;
    }
  }
  // except the photo id from the array fo photoIds
  const photoIdsInput = document.getElementById('photoIds');
  const photoIds = photoIdsInput.value.split(',');
  // console.log('typeof elem.dataset.pid', typeof elem.dataset.pid);
  photoIdsInput.value = photoIds.filter((id) => id !== elem.dataset.pid).join();
  // remove the photo preview
  elem.remove();
  // check the activation condition of the post button
  checkAndUpdatePostBtn();
}
const photoRemoveBtns = document.querySelectorAll('.photoRemoveBtn');
photoRemoveBtns.forEach((btn) => btn.addEventListener('click', photoRemoveEventHandler));

// 게시글 이미지 upload
document.getElementById('photo')?.addEventListener('change', (e) => {
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
      const photoIdsInput = document.getElementById('photoIds');
      photoIdsInput.value += photoIdsInput.value === '' ? photoIds.join() : `,${photoIds.join()}`;
      // add previews for new photos
      const preview = document.querySelector('.photo-preview.invisible');
      preview.classList.remove('invisible');
      for (let previewClone, i = 0; i < urls.length; i += 1) {
        previewClone = preview.cloneNode(true);
        previewClone.setAttribute('data-pid', photoIds[i]);
        preview.insertAdjacentElement('beforebegin', previewClone);
        previewClone.querySelector('img').src = urls[i];
        previewClone
          .querySelector('.photoRemoveBtn')
          .addEventListener('click', photoRemoveEventHandler);
      }
      preview.classList.add('invisible');

      // check the activation condition of the post button
      checkAndUpdatePostBtn();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('POST', '/photo');
  xhr.send(formData);
});
