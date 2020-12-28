// messenger 버튼 제거
document.getElementById('messenger')?.remove();

// 다른 사용자와 채팅
document.querySelectorAll('li').forEach((list) => {
  list.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const addr = `/messenger/${currentTarget.dataset.roomId}`;
    if (window.location.href !== addr) window.location.href = addr;
  });
});

// 현재 채팅방 정보란 토글
document.getElementById('roomInfo')?.addEventListener('click', (e) => {
  const { currentTarget } = e;
  currentTarget.children[0].classList.toggle('roomInfoActive');
  document.getElementById('roomOptions')?.classList.toggle('invisible');
});

// 채팅란 클릭시 input focus
document.getElementById('messages')?.addEventListener('click', (e) => {
  const { currentTarget } = e;
  currentTarget.parentNode.querySelector('#msgInput').focus();
});

// 마지막 상대방 채팅 옆에 프로필 이미지 띄우기
const friendMsgs = document.querySelectorAll('.friendMsg');
if (friendMsgs.length) {
  const profilePhotoDiv = friendMsgs[friendMsgs.length - 1].children[0];
  const img = document.createElement('img');
  img.src = profilePhotoDiv.dataset.friendImg;
  profilePhotoDiv.appendChild(img);
}

// 메시지 작성 이벤트
document.getElementById('messageForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const { currentTarget } = e;
  const { roomId } = currentTarget.dataset;
  const inputElem = currentTarget.querySelector('#msgInput');
  if (inputElem.value) {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 201) {
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
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const { messageId } = currentTarget.parentNode.dataset;
    const { roomId } = currentTarget.parentNode.parentNode.dataset;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status !== 204) console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/message/${messageId}/room/${roomId}`);
    xhr.send();
  });
});
