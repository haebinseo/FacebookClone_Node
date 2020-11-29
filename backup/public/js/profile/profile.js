// 프로필 이미지 업데이트 탭 토글
document.getElementById('profilePhotoUpdateBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('profilePhotoUpdateTab').classList.remove('invisible');
});
document.getElementById('profilePhotoUpdateCloseBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.remove('noScroll');
  document.getElementById('profilePhotoUpdateTab').classList.add('invisible');
});
