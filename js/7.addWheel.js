(function () {
    function addWheel(ele, fn) {
        function wheel(e) {
            e = e || window.event;
            //因为这两样浏览器对滚轮的值不一样，要统一口径，滚轮向下移动代表true，否则false
            var bOk = false;
            if(e.detail) { //firefox:方法   IE chrome 下此值为假
                bOk = e.detail > 0 ? true : false;
            }else {
                //ie chrome
                bOk = e.wheelDelta < 0 ? true : false;
            }
            fn && fn.call(ele, bOk);
            e.preventDefault ? e.preventDefault() : e.returnValue = false;
        }
        //根据浏览器的版本来判断用户是哪个浏览器
        //firefox
        if(window.navigator.userAgent.toLowerCase().indexOf('firefox') !==-1 ) {
            ele.addEventListener('DOMMouseScroll', wheel, false);
        }else {
            //IE chrome
            ele.onmousewheel = wheel;
        }
    }
    window.addWheel = addWheel;
})();