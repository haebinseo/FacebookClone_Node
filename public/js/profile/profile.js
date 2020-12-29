const profilePhotoUpdateBtn = document.getElementById('profilePhotoUpdateBtn');
const profilePhotoUpdateTab = document.getElementById('profilePhotoUpdateTab');

// 프로필 이미지 업데이트 탭의 사진 선택 이벤트
function profilePhotoSelectEventHandeler(e) {
  const { currentTarget } = e;
  const selectedPrev = profilePhotoUpdateTab.querySelector('.selected');
  if (selectedPrev) {
    // 기존의 selected 제거
    selectedPrev.classList.remove('selected');
  } else {
    // update button 활성화
    document.getElementById('updateBtn').disabled = false;
  }

  const imgElem = currentTarget.querySelector('img');
  imgElem.classList.add('selected');
}

// 프로필 이미지 업데이트 탭의 업로드한 사진 불러오기
function fetchPhotosUploaded(limit6 = true, offset = 0) {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 200) {
      // arrange photos
      const photos = JSON.parse(xhr.responseText);
      const profilePhotoCandidate = document.querySelector('.profilePhotoCandidate');
      if (!offset) {
        while (profilePhotoCandidate.children.length > 1) {
          profilePhotoCandidate.lastChild.remove();
        }
      }
      const photoElemSample = profilePhotoCandidate.children[0];
      const maxNumPhoto = limit6 ? Math.min(6, photos.length) : photos.length;
      for (let i = 0; i < maxNumPhoto; i += 1) {
        const photoElemClone = photoElemSample.cloneNode(true);
        photoElemClone.children[0].children[0].src = photos[i].url;
        photoElemClone.classList.remove('invisible');
        photoElemClone.addEventListener('click', profilePhotoSelectEventHandeler);
        profilePhotoCandidate.appendChild(photoElemClone);
      }

      if (limit6 && photos.length > 6) {
        const morePhotoBtn = document.createElement('div');
        const div = document.createElement('div');
        morePhotoBtn.classList.add('morePhotoBtn');
        morePhotoBtn.innerText = '더 보기';
        morePhotoBtn.appendChild(div);
        // 더 보기 버튼 클릭 이벤트
        morePhotoBtn.addEventListener('click', (e) => {
          const { currentTarget } = e;
          console.log('currentTarget: ', currentTarget);
          currentTarget.remove();
          fetchPhotosUploaded(false, 6);
        });
        profilePhotoCandidate.parentNode.appendChild(morePhotoBtn);
      }
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('GET', `/user/photo?offset=${offset}${limit6 ? '&limit=7' : ''}`);
  xhr.send();
}
if (profilePhotoUpdateTab) {
  fetchPhotosUploaded();
}

// 프로필 이미지 업데이트 탭 토글
profilePhotoUpdateBtn?.addEventListener('click', () => {
  document.querySelector('body').classList.add('noScroll');
  profilePhotoUpdateTab.classList.remove('invisible');
});
function hideProfilePhotoUpdateTab() {
  document.querySelector('body').classList.remove('noScroll');
  profilePhotoUpdateTab.classList.add('invisible');
  // 초기화
  const selectedPrev = profilePhotoUpdateTab.querySelector('.selected');
  if (selectedPrev) {
    // 기존의 selected 제거
    selectedPrev.classList.remove('selected');
    // update button 비활성화
    document.getElementById('updateBtn').disabled = true;
  }
}
document
  .getElementById('profilePhotoUpdateCloseBtn')
  ?.addEventListener('click', hideProfilePhotoUpdateTab);
document
  .querySelector('#profilePhotoUpdateTab>div')
  .addEventListener('click', hideProfilePhotoUpdateTab);
document.addEventListener('keyup', (e) => {
  if (!profilePhotoUpdateTab.classList.contains('invisible') && e.code === 'Escape') {
    hideProfilePhotoUpdateTab();
  }
});

// 프로필 이미지 업데이트 이벤트 핸들러
profilePhotoUpdateTab?.querySelector('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const { currentTarget } = e;
  const photoURL = currentTarget.querySelector('.selected').src;

  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
    if (xhr.status === 204) {
      window.location.reload();
    } else {
      console.error(xhr.responseText);
    }
  };
  xhr.open('PATCH', '/user/info');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ photoURL }));
});

export { hideProfilePhotoUpdateTab };
