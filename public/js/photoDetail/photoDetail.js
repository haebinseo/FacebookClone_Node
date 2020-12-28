// 메인 화면으로 돌아가기
let pageOffset = window.sessionStorage.getItem('pageOffset');
pageOffset = pageOffset ? pageOffset - 1 : -1;
window.sessionStorage.setItem('pageOffset', pageOffset);
function goBackToMainPage() {
  window.sessionStorage.removeItem('pageOffset');
  window.history.go(pageOffset);
}
document.querySelector('.exitBtn')?.addEventListener('click', goBackToMainPage);
document.addEventListener('keyup', (e) => {
  if (e.code === 'Escape') goBackToMainPage();
});

// 전체화면
function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    /* IE11 */
    elem.msRequestFullscreen();
  }
}
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE11 */
    document.msExitFullscreen();
  }
}
function toggleFullscreen(e) {
  const { currentTarget } = e;
  if (currentTarget.classList.contains('activated')) closeFullscreen();
  else openFullscreen(document.documentElement);
  currentTarget.classList.toggle('activated');
}
document.querySelector('.fullscreenBtn')?.addEventListener('click', toggleFullscreen);

// photoArea에서 마우스 이동시 prevBtn, nextBtn 보이기
let prevBtnTimer;
let nextBtnTimer;
function setNewBtnTimer(buttonId) {
  clearTimeout(buttonId === 'prevBtn' ? prevBtnTimer : nextBtnTimer);
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.classList.remove('invisible');
  if (buttonId === 'prevBtn') {
    prevBtnTimer = setTimeout(() => btn.classList.add('invisible'), 1500);
  } else {
    nextBtnTimer = setTimeout(() => btn.classList.add('invisible'), 1500);
  }
}

// photoArea - mouse move
document.getElementById('photoArea').addEventListener('mousemove', () => {
  setNewBtnTimer('prevBtn');
  setNewBtnTimer('nextBtn');
});
// prevBtn - mouse enter & mouse leave
document.getElementById('prevBtn')?.addEventListener('mouseenter', () => {
  clearTimeout(prevBtnTimer);
});
document.getElementById('prevBtn')?.addEventListener('mouseleave', () => {
  setNewBtnTimer('prevBtn');
});
// nextBtn - mouse enter & mouse leave
document.getElementById('nextBtn')?.addEventListener('mouseenter', () => {
  clearTimeout(nextBtnTimer);
});
document.getElementById('nextBtn')?.addEventListener('mouseleave', () => {
  setNewBtnTimer('prevBtn');
});
