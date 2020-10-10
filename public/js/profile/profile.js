// 계정 탭 토글
document.getElementById('account')?.addEventListener('click', () => {
  document.getElementById('accountTab')?.classList.toggle('invisible');
});

// 계정 프로필 이동 이벤트
const profileBtns = document.querySelectorAll('.profileBtn');
profileBtns.forEach((btn) => {
  btn.addEventListener('click', function () {
    window.location.href = `/profile/${this.dataset.uid}`;
  });
});

// 로그아웃
document.getElementById('logout')?.addEventListener('click', function () {
  this.submit();
});

// 메신저 버튼 이동 이벤트 등록
document.getElementById('messenger')?.addEventListener('click', () => {
  window.location.href = '/messenger';
});

// 프로필 이미지 업데이트 탭 토글
document.getElementById('profileImgUpdateBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('profileImgUpdateTab').classList.remove('invisible');
});
document.getElementById('profileImgUpdateCloseBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.remove('noScroll');
  document.getElementById('profileImgUpdateTab').classList.add('invisible');
});
