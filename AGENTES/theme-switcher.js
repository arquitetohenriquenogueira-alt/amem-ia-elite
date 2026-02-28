(function () {
    const theme = localStorage.getItem('amem_ia_theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    }
})();

window.toggleTheme = function () {
    const isLight = document.body.classList.toggle('light-theme');
    if (isLight) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    }
    localStorage.setItem('amem_ia_theme', isLight ? 'light' : 'dark');
    window.dispatchEvent(new Event('themeChanged'));
};

