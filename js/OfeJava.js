document.addEventListener('click', function(event) {
    if (event.target.classList.contains('back-button')) {
        history.back();
    }
});
