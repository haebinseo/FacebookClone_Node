// 계정 탭 토글
document.getElementById('account')?.addEventListener('click', () => {
  document.getElementById('accountTab')?.classList.toggle('invisible');
});

// 로그아웃
document.getElementById('logout')?.addEventListener('click', function () {
  this.submit();
});

// 다른 사용자와 채팅
document.querySelectorAll('li').forEach((list) => {
  list.addEventListener('click', function () {
    const addr = `/messenger/${this.dataset.rid}`;
    if (window.location.href !== addr) window.location.href = addr;
  });
});

// 현재 채팅방 정보란 토글
document.getElementById('roomInfo')?.addEventListener('click', function () {
  this.children[0].classList.toggle('roomInfoActive');
  document.getElementById('roomOptions')?.classList.toggle('invisible');
});

// 채팅란 클릭시 input focus
document.getElementById('messages')?.addEventListener('click', function () {
  this.parentNode.querySelector('#msgInput').focus();
});

// 마지막 상대방 채팅 옆에 프로필 이미지 띄우기
const friendMsgs = document.querySelectorAll('.friendMsg');
if (friendMsgs.length) {
  const profileImgDiv = friendMsgs[friendMsgs.length - 1].children[0];
  const img = document.createElement('img');
  img.src = profileImgDiv.dataset.friendImg;
  profileImgDiv.appendChild(img);
}

// 메시지 작성 이벤트
document.getElementById('messageForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const roomId = this.dataset.rid;
  // const friendId = this.querySelector('#fidInput');
  const inputElem = this.querySelector('#msgInput');
  if (inputElem.value) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        inputElem.value = '';
        if (xhr.getResponseHeader('Content-Type') === 'text/html; charset=utf-8') {
          window.location.reload();
        }
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open('POST', `/message/room/${roomId}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(
      JSON.stringify({
        // friendId: friendId.value,
        content: inputElem.value,
      }),
    );
  }
});

// 메시지 삭제 버튼 이벤트 등록
document.querySelectorAll('.deleteMsgBtn').forEach((btn) => {
  btn.addEventListener('click', function () {
    const { mid } = this.parentNode.dataset;
    const { rid } = this.parentNode.parentNode.dataset;
    // const { fid } = this.dataset;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status !== 200) console.error(xhr.responseText);
    };
    // xhr.open('DELETE', `/message/${rid}/${mid}?fid=${fid}`);
    xhr.open('DELETE', `/message/${mid}/room/${rid}`);
    xhr.send();
  });
});
