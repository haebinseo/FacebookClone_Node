// add photo event handler
document.getElementById('addPhoto')?.addEventListener('change', (e) => {
  const formData = new FormData();
  const { files } = e.target;

  for (let i = 0; i < files.length; i += 1) {
    formData.append('photos', files[i], files[i].name);
  }

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 201) window.location.reload();
    else console.error(xhr.responseText);
  };
  xhr.open('POST', '/photo');
  xhr.send(formData);
});

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
  photoOptList.setAttribute('data-pid', photoSelected.dataset.pid);
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
  btn.addEventListener('click', () => {
    const photoSelected = document.querySelector('.photoSelected');
    if (photoSelected) {
      // a photo button is already clicked
      if (photoSelected === btn) {
        // same button is clicked twice
        btn.classList.remove('photoSelected');
        photoOptTab.classList.add('invisible');
        return;
      }
      photoSelected.classList.remove('photoSelected');
    }

    btn.classList.add('photoSelected');
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
function deselectPhoto() {
  const photoSelected = document.querySelector('.photoSelected');
  photoSelected?.classList.remove('photoSelected');
  photoOptTab.classList.add('invisible');
}
if (photoOptTab) {
  document.querySelector('body').addEventListener('click', (e) => {
    let elem = e.target;
    while (!(elem.classList.contains('photoOptBtn') || elem.classList.contains('photoOptTab'))) {
      elem = elem.parentNode;
      if (elem.nodeName === 'BODY') {
        elem = null;
        deselectPhoto();
        return;
      }
    }

    if (elem.classList.contains('photoOptBtn') && !elem.classList.contains('photoSelected')) {
      deselectPhoto();
    }
  });
}

if (photoOptTab) {
  // add profile photo change event handler
  document.querySelector('.setProfilePhotoBtn').addEventListener('click', () => {
    const { uid: userId, pid: photoId } = photoOptList.dataset;

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('PATCH', `/profile/${userId}/profilePhoto/${photoId}`);
    xhr.send();
  });

  // add photo remove event handler
  document.querySelector('.removePhotoBtn').addEventListener('click', () => {
    const { pid: photoId } = photoOptList.dataset;

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 204) window.location.reload();
      else console.error(xhr.responseText);
    };
    xhr.open('DELETE', `/photo/${photoId}`);
    xhr.send();
  });
}
