// 계정 탭 토글
document.getElementById('account')?.addEventListener('click', () => {
  document.getElementById('accountTab')?.classList.toggle('invisible');
});

// 로그아웃
document.getElementById('logout')?.addEventListener('click', function () {
  this.submit();
});

// 현재 채팅방 정보란 토글
document.getElementById('roomInfo')?.addEventListener('click', function () {
  this.children[0].classList.toggle('roomInfoActive');
  document.getElementById('roomOptions')?.classList.toggle('invisible');
});

// 채팅란 클릭시 input focus
document.getElementById('messages')?.addEventListener('click', function () {
  this.querySelector('#msgInput').focus();
});

// 메시지 작성 이벤트
document.getElementById('messageForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const roomId = this.dataset.rid;
  const friendId = this.querySelector('#fidInput');
  const inputElem = this.querySelector('#msgInput');
  if (inputElem.value) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) inputElem.value = '';
      else console.error(xhr.responseText);
    };
    xhr.open('POST', `/message/${roomId}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(
      JSON.stringify({
        friendId,
        content: inputElem.value,
      }),
    );
  }
});
