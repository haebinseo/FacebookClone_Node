// 게시글 작성 탭 토글
document.getElementById('newPostTabBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('newPostTab').classList.remove('invisible');
  document.getElementById('postContent').focus();
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
    if (xhr.status === 201) window.location.reload();
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
    `/like/${
      isPost ? `post/${currentTarget.dataset.pid}` : `comment/${currentTarget.dataset.cid}`
    }`,
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
    const commentInput = currentTarget.parentNode.parentNode.querySelector('.commentContent');
    commentInput.focus();
  });
});

// 대댓글 버튼 클릭 시 댓글란 생성
const replyBtn = document.querySelectorAll('.replyBtn');
replyBtn.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const targetPlace = currentTarget.parentNode.parentNode.parentNode;
    const depth = 1;
    const { bundleCreatedAt } = currentTarget.dataset;

    let elem = currentTarget;
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
  const commentId = form.dataset.cid;
  const contentInput = form.querySelector('input[name="content"]');
  const data = { content: contentInput.value };
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 204) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('POST', `/comment/update/${commentId}`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
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
    const commentId = currentTarget.parentNode.dataset.cid;
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/comment/${commentId}`);
    xhr.send();
  });
});

// 친구 옵션 탭 토글
document.querySelectorAll('.friendBtn')?.forEach((bnt) => {
  bnt.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const tab = currentTarget.querySelector('.friendOptTab');
    tab.classList.toggle('invisible');
  });
});

// accountHoverTab invisible 토글
// const isAccountHoverTabHovered = [];
// document.querySelectorAll('.accountHoverTab')?.forEach((tab, idx) => {
//   isAccountHoverTabHovered.push(false);
//   tab.addEventListener('mouseenter', () => {
//     isAccountHoverTabHovered[idx] = true;
//   });
//   tab.addEventListener('mouseleave', (e) => {
//     const { currentTarget } = e;
//     isAccountHoverTabHovered[idx] = false;
//     currentTarget.classList.add('invisible');
//     currentTarget.querySelector('.friendOptTab')?.classList.add('invisible'); // 친구 탭 닫기
//   });
// });
// document.querySelectorAll('.accountHoverTabTrigger')?.forEach((trigger, idx) => {
//   const accountHoverTab = trigger.parentNode.parentNode.parentNode.querySelector(
//     '.accountHoverTab',
//   );
//   const tabIdx = Math.floor(idx / 2);
//   trigger.addEventListener('mouseenter', () => {
//     accountHoverTab.classList.remove('invisible');
//   });
//   trigger.addEventListener('mouseleave', () => {
//     setTimeout(() => {
//       if (!isAccountHoverTabHovered[tabIdx]) {
//         accountHoverTab.classList.add('invisible');
//         accountHoverTab.querySelector('.friendOptTab')?.classList.add('invisible'); // 친구 탭 닫기
//       }
//     }, 100);
//   });
// });

const accountHoverTabTriggers = document.querySelectorAll('.accountHoverTabTrigger');
const accountHoverTab = document.querySelector('.accountHoverTab');

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
let isCursorHoveringTab = false;
let timerForTab;
function setTimerForTab() {
  timerForTab = setTimeout(() => {
    const accountTriggerSelected = document.querySelector('.accountTriggerSelected');
    if (accountTriggerSelected || isCursorHoveringTab) return;
    /*
     * a cursor hasn't entered any trigger in 200ms after leave
     * and a cursor isn't hovering over the accountHoverTab
     */
    // for (let i = 0; i < 4; i += 1) {
    //   accountHoverTab.children[1].children[i].classList.add('invisible');
    // }
    // document.getElementById('defaultAHTab').classList.remove('invisible');
    accountHoverTab.classList.add('invisible');
  }, 200);
}
accountHoverTabTriggers.forEach((trigger) => {
  trigger.addEventListener('mouseenter', (e) => {
    const { currentTarget } = e;
    clearTimeout(timerForTab); // cancel the timer for hiding accountHoverTab

    currentTarget.classList.add('accountTriggerSelected');
    // copy data from the trigger 가 아니라 ajax로 해결해야 할듯
    const postHeader = currentTarget.parentNode.parentNode.parentNode;
    const { postAuthorId } = postHeader.dataset;
    // ajax for checking friend relationship
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200) {
        accountHoverTab.querySelectorAll('a').forEach((a) => {
          a.href = `/profile/${postAuthorId}`;
        });
        accountHoverTab.querySelector('a>img').src = postHeader.querySelector(
          'img.accountHoverTabTrigger',
        ).src;
        accountHoverTab.querySelector('a>span').innerText = postHeader.querySelector(
          'span.accountHoverTabTrigger',
        ).innerText;
        accountHoverTab.children[1].setAttribute('data-uid', postAuthorId);
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
    xhr.open('GET', `/user/friend/${postAuthorId}`);
    xhr.send();
  });

  trigger.addEventListener('mouseleave', (e) => {
    const { currentTarget } = e;
    currentTarget.classList.remove('accountTriggerSelected');
    setTimerForTab(); // set a timer for hiding accountHoverTab automatically
  });
});
accountHoverTab.addEventListener('mouseenter', () => {
  clearTimeout(timerForTab); // cancel the timer for hiding accountHoverTab
  isCursorHoveringTab = true;
});
accountHoverTab.addEventListener('mouseleave', () => {
  isCursorHoveringTab = false;
  setTimerForTab(); // set a timer for hiding accountHoverTab automatically
});

// event handler about friend
function friendEventHandler(e) {
  const { currentTarget } = e;
  const targetUserId = document.querySelector('.accountHoverTab>div:nth-of-type(2)').dataset.uid;
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
document.querySelector('.addFriendBtn')?.addEventListener('click', friendEventHandler);
// confirm friend
document.querySelector('.acceptFriendBtn')?.addEventListener('click', friendEventHandler);
// cancel friend request
// document.querySelector('.friendRequestedBtn')?.addEventListener('click', friendEventHandler);
// delete friend
document.querySelector('.unfriendBtn').addEventListener('click', friendEventHandler);
