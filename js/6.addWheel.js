(function () {
    function addWheel(ele, fn) {
        //在wheel方法里对移动的轨迹进行确定
        function wheel(e) {
            e = e || window.event;
            var bOk = false;
            if (e.detail) {  //firefox
                bOk = e.detail > 0 ? true : false;
            } else { //IE chrome
                bOk = e.wheelDelta < 0 ? true : false;
            }
            fn && fn.call(ele, bOk);
            //阻止默认事件的发生
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }

        //根据不同的浏览器绑定不同的方法
        if (window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
            ele.addEventListener('DOMMouseScroll', wheel, false);
        } else {
            ele.onmousewheel = wheel;
        }
    }

    window.addWheel = addWheel;
})();