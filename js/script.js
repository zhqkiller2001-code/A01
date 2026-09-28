document.addEventListener('DOMContentLoaded', () => {
  // ================= 1. 移动端导航栏与汉堡包菜单控制（修复补全） =================
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navMenu = document.querySelector('.nav-menu');
  const solutionsDropdown = document.getElementById('solutionsDropdown');
  const langDropdown = document.querySelector('.lang-dropdown');

  // 1.1 点击汉堡包按钮，切换菜单展开/收起
  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburgerBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // 1.2 移动端点击 Solutions 展开/收起子菜单
  if (solutionsDropdown) {
    solutionsDropdown.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        solutionsDropdown.classList.toggle('open');
      }
    });
  }

  // 1.3 移动端点击语言切换展开/收起子菜单
  if (langDropdown) {
    langDropdown.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
      }
    });
  }

  // 1.4 点击页面空白处收起所有已展开的导航菜单
  document.addEventListener('click', () => {
    if (hamburgerBtn && navMenu) {
      hamburgerBtn.classList.remove('active');
      navMenu.classList.remove('active');
    }
    if (solutionsDropdown) solutionsDropdown.classList.remove('open');
    if (langDropdown) langDropdown.classList.remove('open');
  });


  // ================= 2. 暗黑水资源压力数据区动画 =================
  const waterSection = document.getElementById('waterStressSection');
  const counterEl = document.getElementById('stressCounter');

  if (waterSection && counterEl) {
    let animationFrameId = null; // 用于记录并取消未完成的数字动画

    // 2.1 设置视口观察器
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 当进入视口：添加激活类，播放数字增长动画
          waterSection.classList.add('is-active');
          animateCounter(counterEl, 0, 25, 1800);
        } else {
          // 当离开视口：清空状态，重置数字与 CSS 动画
          waterSection.classList.remove('is-active');
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          counterEl.textContent = '0';
        }
      });
    }, { threshold: 0.2 });

    observer.observe(waterSection);

    // 2.2 平滑数字递增函数
    function animateCounter(element, start, end, duration) {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      let startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        // 三次缓出效果
        const easeOut = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.floor(easeOut * (end - start) + start);

        if (progress < 1) {
          animationFrameId = window.requestAnimationFrame(step);
        } else {
          element.textContent = end;
          animationFrameId = null;
        }
      }

      animationFrameId = window.requestAnimationFrame(step);
    }
  }


  // ================= 3. 浅色报告区：3 个层级元素随滚动渐显与重置 =================
  const fadeTiers = document.querySelectorAll('.fade-tier');

  if (fadeTiers.length > 0) {
    const tierObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible'); // 移除视口后自动重置，再次滑入可重复触发
        }
      });
    }, { threshold: 0.15 });

    fadeTiers.forEach(tier => tierObserver.observe(tier));
  }


  // ================= 4. 图片遮罩数字滚动递增与重置 =================
  const cardWrappers = document.querySelectorAll('.card-image-wrapper');

  if (cardWrappers.length > 0) {
    const activeFrameIds = new Map(); // 管理各个数字的动画帧 ID

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const counters = entry.target.querySelectorAll('.counter');

        if (entry.isIntersecting) {
          // 进入视口，触发数字增加
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const useComma = counter.getAttribute('data-comma') === 'true';
            animateCardCounter(counter, 0, target, 1800, useComma, activeFrameIds);
          });
        } else {
          // 离开视口，取消当前动画并重置为 0
          counters.forEach(counter => {
            if (activeFrameIds.has(counter)) {
              cancelAnimationFrame(activeFrameIds.get(counter));
              activeFrameIds.delete(counter);
            }
            counter.textContent = '0';
          });
        }
      });
    }, { threshold: 0.3 });

    cardWrappers.forEach(wrapper => cardObserver.observe(wrapper));
  }

  // 数字动画核心计算函数
  function animateCardCounter(element, start, end, duration, useComma, frameMap) {
    if (frameMap.has(element)) {
      cancelAnimationFrame(frameMap.get(element));
    }
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // 三次缓出算法
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * (end - start) + start);

      // 是否加上千分位逗号（如 5,000）
      element.textContent = useComma ? currentVal.toLocaleString('en-US') : currentVal;

      if (progress < 1) {
        const frameId = window.requestAnimationFrame(step);
        frameMap.set(element, frameId);
      } else {
        element.textContent = useComma ? end.toLocaleString('en-US') : end;
        frameMap.delete(element);
      }
    }

    const frameId = window.requestAnimationFrame(step);
    frameMap.set(element, frameId);
  }


  // ================= 5. 页脚手风琴折叠（仅移动端 <= 768px 生效） =================
  const accordionToggles = document.querySelectorAll('.site-footer .accordion-toggle');

  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const parentCol = toggle.closest('.accordion-col');
        if (parentCol) {
          parentCol.classList.toggle('is-open');
        }
      }
    });
  });
});