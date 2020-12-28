// friendOptTab 관련
const profileFriend = document.getElementById('profileFriend');
const friendOptTab = profileFriend.querySelector('.friendOptTab');

function fillFriendOptTabData() {
  if (!friendOptTab) return;
  const friendOptBtnSelected = document.querySelector('.friendOptBtnSelected');
  friendOptTab.setAttribute('data-friend-id', friendOptBtnSelected.dataset.friendId);
}

function translateFriendOptTab() {
  const friendOptBtnSelected = document.querySelector('.friendOptBtnSelected');
  if (!friendOptBtnSelected) return;

  const btnCliRect = friendOptBtnSelected.getBoundingClientRect();
  const tabCliRect = friendOptTab.getBoundingClientRect();
  const scrolledY = window.pageYOffset;
  const margin = 24;
  const gapBtnTab = 4; // gap between a button and tab

  const translate = { x: btnCliRect.x, y: btnCliRect.bottom + gapBtnTab };

  if (window.innerWidth < btnCliRect.x + tabCliRect.width + margin) {
    // the friendOptTab overflows the window horizentally
    if (window.innerWidth < btnCliRect.right + margin) {
      // so does button
      translate.x = btnCliRect.right - tabCliRect.width;
    } else {
      translate.x = window.innerWidth - tabCliRect.width - margin;
    }
  }
  if (window.innerHeight < btnCliRect.bottom + gapBtnTab + tabCliRect.height + margin) {
    // the photoOptList overflows the window vertically
    translate.y = btnCliRect.y - tabCliRect.height - gapBtnTab;
  }
  translate.y += scrolledY;

  friendOptTab.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
}

// 친구 옵션 탭 토글
profileFriend.querySelectorAll('.friendOptBtn')?.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const friendOptBtnSelected = document.querySelector('.friendOptBtnSelected');
    if (friendOptBtnSelected) {
      // a friend button is already clicked
      if (friendOptBtnSelected.isSameNode(currentTarget)) {
        // same button is clicked twice
        currentTarget.classList.remove('friendOptBtnSelected');
        friendOptTab.classList.add('invisible');
        return;
      }
      friendOptBtnSelected.classList.remove('friendOptBtnSelected');
    }

    currentTarget.classList.add('friendOptBtnSelected');
    friendOptTab.classList.remove('invisible');
    fillFriendOptTabData();
    translateFriendOptTab();
  });
});

// friendOptTab auto translation when window is resized or scrolled
if (friendOptTab) {
  window.addEventListener('resize', translateFriendOptTab);
  window.addEventListener('scroll', translateFriendOptTab);
}

// hide friendOptTab when outside of button and tab is clicked
if (friendOptTab) {
  document.querySelector('body').addEventListener('click', (e) => {
    // friendOptTab이 비활성화시 종료
    if (friendOptTab.classList.contains('invisible')) return;

    let elem = e.target;
    while (!(elem.classList.contains('friendOptBtn') || elem.classList.contains('friendOptTab'))) {
      elem = elem.parentNode;
      if (elem.nodeName === 'BODY') {
        elem = null;
        // deselect the friend button
        const friendOptBtnSelected = document.querySelector('.friendOptBtnSelected');
        friendOptBtnSelected?.classList.remove('friendOptBtnSelected');
        friendOptTab.classList.add('invisible');
        return;
      }
    }
  });
}

if (friendOptTab) {
  // 친구 옵션의 친구 끊기 이벤트 추가
  // unfriend event handler
  friendOptTab.querySelector('.unfriendBtn').addEventListener('click', () => {
    const { friendId } = friendOptTab.dataset;

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/user/friend/${friendId}`);
    xhr.send();
  });
}

// accountHoverTab 관련
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
  accountHoverTab.querySelector('.friendOptTab')?.classList.toggle('invisible');
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
