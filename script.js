const mobileMenu = document.querySelector('#mobileMenu');
const menuToggle = document.querySelector('.menu-toggle');
const mobileLinks = document.querySelectorAll('.mobile-nav a');
const desktopLinks = document.querySelectorAll('.main-menu a');

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
}

function attachScrollBehavior(links) {
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      link.addEventListener('click', (event) => {
        const target = document.querySelector(href);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
        }
      });
    }
  });
}

attachScrollBehavior(desktopLinks);
attachScrollBehavior(mobileLinks);

menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
