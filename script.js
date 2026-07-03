const navLinks = document.querySelectorAll('.main-menu a');
const menuToggle = document.querySelector('.menu-toggle');
const mainMenu = document.querySelector('.main-menu');

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      mainMenu.classList.remove('open');
    }
  });
});

menuToggle.addEventListener('click', () => {
  mainMenu.classList.toggle('open');
});
