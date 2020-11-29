// 정보 수정 탭 토글
document.getElementById('accountInfoEditBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  document.getElementById('profileEditTab').classList.remove('invisible');
});
function tabCloseEventHandler(e) {
  e.preventDefault();
  document.querySelector('body').classList.remove('noScroll');
  document.getElementById('profileEditTab').classList.add('invisible');
}
document
  .getElementById('profileEditCloseBtn')
  ?.addEventListener('click', tabCloseEventHandler);
document
  .getElementById('profileEditCancelBtn')
  ?.addEventListener('click', tabCloseEventHandler);
