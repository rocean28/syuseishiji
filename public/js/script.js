document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    setupHighlightLinks();
    responsiveElm();
  }, 500); // DOM反映待ちのため少し遅延
});

// Reactのタブ切り替え後にフックして再実行
window.addEventListener('highlightUpdate', () => {
  setTimeout(() => {
    setupHighlightLinks();
  }, 100); // DOM反映待ちのため少し遅延
});

function setupHighlightLinks() {
  const rects = document.querySelectorAll('[id^="rect-"]');

  rects.forEach((rectEl) => {
    const rectId = rectEl.id.replace('rect-', '');
    const itemEl = document.getElementById(`item-${rectId}`);
    if (!itemEl) return;

    // すでにリスナー登録済みならスキップ（フラグを使う）
    if (rectEl.dataset.bound === 'true') return;

    rectEl.addEventListener('click', () => {
      itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelectorAll('.highlight').forEach((el) => el.classList.remove('highlight'));
      rectEl.classList.add('highlight');
    });

    itemEl.addEventListener('click', () => {
      rectEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelectorAll('.highlight').forEach((el) => el.classList.remove('highlight'));
      rectEl.classList.add('highlight');
    });

    // フラグを立てて再登録を防止
    rectEl.dataset.bound = 'true';
  });
}

function responsiveElm() {
  const elms = document.querySelectorAll('.js-responsiveElm');
  if (!elms.length) return;

  elms.forEach(elm => {
    const wrapper = document.createElement('div');
    wrapper.className = 'js-responsiveElmWrap';
    wrapper.style.width = '100%';

    // wrap
    elm.parentNode.insertBefore(wrapper, elm);
    wrapper.appendChild(elm);
  });

  function applyScale() {
    const winWidth = window.innerWidth;

    elms.forEach(elm => {
      const wrap = elm.parentElement;
      if (winWidth > 1920) {
        elm.style.transform = '';
        elm.style.transformOrigin = '';
        wrap.style.height = '';
        return;
      }

      const scale = wrap.clientWidth / elm.offsetWidth;

      if (scale < 1) {
        elm.style.transform = `scale(${scale})`;
        elm.style.transformOrigin = 'top left';
        wrap.style.height = `${elm.offsetHeight * scale}px`;
      } else {
        elm.style.transform = '';
        elm.style.transformOrigin = '';
        wrap.style.height = '';
      }
    });
  }

  const debouncedResize = debounce(applyScale, 10);
  window.addEventListener('resize', debouncedResize);
  applyScale(); // 初回適用
}

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
