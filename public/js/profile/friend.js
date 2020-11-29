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
  const accountHoverTab = trigger.parentNode.parentNode.querySelector('.accountHoverTab');
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

// 친구 옵션 탭 토글
document.querySelectorAll('.friendBtn')?.forEach((bnt) => {
  bnt.addEventListener('click', function () {
    const tab = this.querySelector('.friendOptTab');
    tab.classList.toggle('invisible');
  });
});

function friendEventHandler(e) {
  const targetUserId = e.currentTarget.dataset.uid;
  const isUnfriendBtn = e.currentTarget.classList.item(0) === 'unfriendBtn';
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201 || xhr.status === 204) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open(isUnfriendBtn ? 'DELETE' : 'POST', `/friend/${targetUserId}`);
  xhr.send();
}
// 친구 추가
const addFriendBtns = document.querySelectorAll('.addFriendBtn');
addFriendBtns.forEach((btn) => btn.addEventListener('click', friendEventHandler));
// 친구 수락
const acceptFriendBtns = document.querySelectorAll('.acceptFriendBtn');
acceptFriendBtns.forEach((btn) => btn.addEventListener('click', friendEventHandler));
// 친구 끊기
const unfriendBtns = document.querySelectorAll('.unfriendBtn');
unfriendBtns.forEach((btn) => btn.addEventListener('click', friendEventHandler));
