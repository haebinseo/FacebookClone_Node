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
