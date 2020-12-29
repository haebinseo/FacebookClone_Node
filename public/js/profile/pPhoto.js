// event handlers and functions related to photoOptTab
const photoOptTab = document.querySelector('.photoOptTab');
const photoOptList = photoOptTab?.querySelector('.photoOptList');
const triangle = photoOptTab?.querySelector('.triangle');

function fillPhotoOptTabData() {
  if (!photoOptTab) return;
  const photoSelected = document.querySelector('.photoSelected');
  // elements to be filled data
  const a = photoOptTab.querySelector('a');

  a.href = photoSelected.parentNode.children[0].src;
  photoOptList.setAttribute('data-photo-id', photoSelected.dataset.photoId);
}

function translatePhotoOptTab() {
  const photoSelected = document.querySelector('.photoSelected');
  if (!photoSelected) return;

  const btnCliRect = photoSelected.getBoundingClientRect();
  const listCliRect = photoOptList.getBoundingClientRect();
  const scrolledY = window.pageYOffset;
  const margin = 24;
  const halfSizeOfBtn = btnCliRect.height / 2;
  const gapBtnTab = 12; // gap between a button and tab
  const gapBtnTri = 7; // gap between a button and triangle

  const transform = {
    tab: { x: btnCliRect.x, y: scrolledY + btnCliRect.y + halfSizeOfBtn },
    list: { x: 0, y: halfSizeOfBtn + gapBtnTab },
    tri: { x: 10, y: halfSizeOfBtn + gapBtnTri, deg: -45 },
  };

  if (window.innerWidth < btnCliRect.x + listCliRect.width + margin) {
    // the photoOptList overflows the window horizentally
    if (window.innerWidth < btnCliRect.right + margin) {
      // so does button
      transform.list.x = btnCliRect.width - listCliRect.width;
    } else {
      transform.list.x = window.innerWidth - btnCliRect.x - listCliRect.width - margin;
    }
  }
  if (window.innerHeight < btnCliRect.bottom + gapBtnTab + listCliRect.height + margin) {
    // the photoOptList overflows the window vertically
    transform.list.y = -listCliRect.height - gapBtnTab - halfSizeOfBtn;
    transform.tri.y = -halfSizeOfBtn - gapBtnTri - gapBtnTab;
    transform.tri.deg = 135;
  }
  photoOptTab.style.transform = `translate(${transform.tab.x}px, ${transform.tab.y}px)`;
  photoOptList.style.transform = `translate(${transform.list.x}px, ${transform.list.y}px)`;
  triangle.style.transform = `translate(${transform.tri.x}px, ${transform.tri.y}px)  rotate(${transform.tri.deg}deg)`;
}

// photoOptBtn click event
const photoOptBtns = document.querySelectorAll('.photoOptBtn');
photoOptBtns.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const { currentTarget } = e;
    const photoSelected = document.querySelector('.photoSelected');
    if (photoSelected) {
      // a photo button is already clicked
      if (photoSelected.isSameNode(currentTarget)) {
        // same button is clicked twice
        currentTarget.classList.remove('photoSelected');
        photoOptTab.classList.add('invisible');
        return;
      }
      photoSelected.classList.remove('photoSelected');
    }

    currentTarget.classList.add('photoSelected');
    photoOptTab.classList.remove('invisible');
    fillPhotoOptTabData();
    translatePhotoOptTab();
  });
});

// photoOptTab auto translation when window is resized or scrolled
if (photoOptTab) {
  window.addEventListener('resize', translatePhotoOptTab);
  window.addEventListener('scroll', translatePhotoOptTab);
}

// hide photoOptTab when outside of button and tab is clicked
function deselectPhotoOptBtn() {
  const photoSelected = document.querySelector('.photoSelected');
  photoSelected?.classList.remove('photoSelected');
  photoOptTab.classList.add('invisible');
}
if (photoOptTab) {
  document.querySelector('body').addEventListener('click', (e) => {
    // photoOptTab이 비활성화시 종료
    if (photoOptTab.classList.contains('invisible')) return;

    let elem = e.target;
    while (!(elem.classList.contains('photoOptBtn') || elem.classList.contains('photoOptTab'))) {
      elem = elem.parentNode;
      if (elem.nodeName === 'BODY') {
        elem = null;
        deselectPhotoOptBtn();
        return;
      }
    }
  });
  document.addEventListener('keyup', (e) => {
    if (!photoOptTab.classList.contains('invisible') && e.code === 'Escape') {
      deselectPhotoOptBtn();
    }
  });
}

if (photoOptTab) {
  // 사진 옵션의 프로필 사진 등록 이벤트 추가
  // add profile photo change event handler
  document.querySelector('.setProfilePhotoBtn').addEventListener('click', () => {
    const photoSelected = document.querySelector('.photoSelected');
    const photoURL = photoSelected.parentNode.children[0].src;

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('PATCH', `/user/info`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ photoURL }));
  });

  // add photo remove event handler
  document.querySelector('.removePhotoBtn').addEventListener('click', () => {
    const { photoId } = photoOptList.dataset;

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/photo/${photoId}`);
    xhr.send();
  });
}
