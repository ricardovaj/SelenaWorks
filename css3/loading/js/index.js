    var p = 0;
    var bar = document.getElementsByClassName("bar")[0];
    var pageLoadding = document.getElementsByClassName('page_loading')[0];
    var timer = setInterval(function () {
        p++;
        bar.style.width = p + '%';
        if (p == 100) {
            clearInterval(timer);
            pageLoadding.classList.add('complete');
        }
    }, 30);