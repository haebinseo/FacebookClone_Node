const profileEditTab = document.getElementById('profileEditTab');

// 정보 수정 탭 토글
document.getElementById('accountInfoEditBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  profileEditTab.classList.remove('invisible');
});
document.getElementById('profileEditCloseBtn')?.addEventListener('click', () => {
  document.querySelector('body').classList.remove('noScroll');
  profileEditTab.classList.add('invisible');
});

// 정보 수정 이벤트 핸들러
if (profileEditTab) {
  profileEditTab.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const { currentTarget } = e;
    const formData = {
      email: currentTarget.elements.email.value,
      gender: currentTarget.elements.gender.value,
    };
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('PATCH', '/user/info');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(formData));
  });
}

// timelineLeft sticky 구현
let prevScrolledY = 0;
let prevDirection = 1;
const buffer = document.querySelector('#timelineLeft > .buffer');
const timelineLeftContent = document.querySelector('#timelineLeft > .content');
const fixedHeaderOffset = 120;
const contentMargin = 16;
document.addEventListener('scroll', () => {
  const scrolledY = window.pageYOffset;
  const contentClientRect = timelineLeftContent.getBoundingClientRect();
  const bufferClientRect = buffer.getBoundingClientRect();
  const { y: contentY, height: contentH } = contentClientRect;
  const { y: bufferY } = bufferClientRect;
  if (scrolledY < prevScrolledY) {
    // up
    if (prevDirection < 0) {
      buffer.style.height = `${contentY - bufferY}px`;
      prevDirection *= -1;

      timelineLeftContent.style = `bottom: ${
        window.innerHeight - fixedHeaderOffset - contentMargin - contentH
      }px;`;
    }
  } else if (prevDirection > 0) {
    // down
    buffer.style.height = `${contentY - bufferY}px`;
    prevDirection *= -1;

    timelineLeftContent.style = `top: ${window.innerHeight - contentH - contentMargin}px;`;
  }
  // update scrolledY
  prevScrolledY = scrolledY;
});
