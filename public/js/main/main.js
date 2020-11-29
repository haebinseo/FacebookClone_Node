const contactHoverTabTriggers = document.querySelectorAll('.contactHoverTabTrigger');
const contactHoverTab = document.querySelector('.contactHoverTab');

// contactHoverTab auto translate
function contactHoverTabTranslate() {
  const contactSelected = document.querySelector('.contactSelected');

  const contactCliRect = contactSelected.getBoundingClientRect();
  const tabCliRect = contactHoverTab.getBoundingClientRect();
  const sizeOfHeader = 60;
  const margin = 8;

  const translate = {
    x: contactCliRect.x - tabCliRect.width,
    y: contactCliRect.y + (contactCliRect.height - tabCliRect.height) / 2,
  };

  if (translate.y < sizeOfHeader + margin) {
    translate.y = sizeOfHeader + margin;
  } else if (translate.y + tabCliRect.height + margin > window.innerHeight) {
    translate.y = window.innerHeight - tabCliRect.height - margin;
  }

  contactHoverTab.style.transform = `translate(${translate.x}px, ${translate.y}px)`;
}

// event handler to make contactHoverTab visible/invisible
let isCursorHoveringTab = false;
let timerForTab;
function setTimerForTab() {
  timerForTab = setTimeout(() => {
    const contactSelected = document.querySelector('.contactSelected');
    if (contactSelected || isCursorHoveringTab) return;
    // a cursor hasn't entered any contact in 200ms after leave
    // and a cursor isn't hovering over the contact tab
    contactHoverTab.classList.add('invisible');
  }, 200);
}
contactHoverTabTriggers.forEach((trigger) => {
  trigger.addEventListener('mouseenter', (e) => {
    clearTimeout(timerForTab); // cancel the timer for hiding contact tab
    e.currentTarget.classList.add('contactSelected');
    // copy data from the trigger
    contactHoverTab.querySelectorAll('a').forEach((a) => {
      a.href = `/profile/${e.currentTarget.dataset.uid}`;
    });
    contactHoverTab.querySelector('img').src = e.currentTarget.querySelector('img').src;
    contactHoverTab.querySelector('span').innerText = e.currentTarget.querySelector(
      'span',
    ).innerText;
    contactHoverTab.classList.remove('invisible');

    contactHoverTabTranslate(); // relocate the tab along to the new trigger
  });

  trigger.addEventListener('mouseleave', (e) => {
    e.currentTarget.classList.remove('contactSelected');
    setTimerForTab(); // set a timer for hiding contact tab automatically
  });
});
contactHoverTab.addEventListener('mouseenter', () => {
  clearTimeout(timerForTab); // cancel the timer for hiding contact tab
  isCursorHoveringTab = true;
});
contactHoverTab.addEventListener('mouseleave', () => {
  isCursorHoveringTab = false;
  setTimerForTab(); // set a timer for hiding contact tab automatically
});

// contactHoverTab auto translate when contact window is scrolled
const mainRightScroll = document.querySelector('#mainRight div');
mainRightScroll.addEventListener('scroll', contactHoverTabTranslate);
