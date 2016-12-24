(function () {
    function on(ele, type, fn) {
        //标准浏览器下
        if(ele.addEventListener) {
            ele.addEventListener(type, fn, false);
        }else {
            //IE浏览器下
            //IE浏览器下的问题：1.顺序执行问题 2.this指向问题 3.重复调用问题
            if(!ele[type+'onEvent']) {
                ele[type + 'onEvent'] = [];
                //系统事件的调用，只需执行一次，手动改变run方法的this指向
                //因为这里是事件，只有触发的时候才执行，所以避免了重复调用的问题
                //同时，也修改了每个方法的this指向
                ele.attachEvent('on'+ type, processThis(run, ele));
            }
            //将对事件方法的调用按照调用的顺序存放进自己的事件数组里，确保了调用的顺序问题
            var a = ele[type + 'onEvent'];
            for(var i=0; i<a.length; i++) {
                if(a[i]===fn) return;
            }
            a.push(fn);
        }
    }
    function off(ele, type, fn) {
        if(ele.removeEventListener) {
            ele.removeEventListener(type, fn, false);
        }else {
            var a = ele[type + 'onEvent'];
            if(a && a.length) {
                for(var i=0; i<a.length; i++) {
                    if(a[i]==fn) {
                        a[i] = null;
                        break;
                    }
                }
            }
        }
    }
    function run() {
        //IE浏览器下，系统事件不会传事件对象
        var e = window.event;
        e.target = e.target || e.srcElement;
        e.pageX = (document.documentElement.offsetLeft || document.body.offsetLeft) + e.clientX;
        e.pageY = (document.documentElement.offsetTop || document.body.offsetTop) + e.clientY;
        e.preventDefault = function () {
            e.returnValue = false;
        };
        e.stopPropagation = function () {
            e.cancelBubble = true;
        };
        var a = this[e.type + 'onEvent'];
        if(a && a.length) {
            for(var i=0; i<a.length; i++) {
                if(typeof a[i]==='function') {
                    a[i].call(this, e);
                }else {
                    a.splice(i, 1);
                    i--;
                }
            }
        }
    }
    function processThis(fn, context) {
        return function (e) {
            //这里会将传进来的方法this指向改变，并传递一个兼容的事件对象
            e = e || window.event;
            fn.call(context,e);
        }
    }

    window.ev = {
        on: on,
        off: off,
        run: run,
        processThis: processThis
    };
})();