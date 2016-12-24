//封装自己的事件库
//DOM2级事件库，注意兼容性
//闭包方式封装，windows变为全局变量
(function () {
    function on(ele, type, fn) {
        //先判断是否为自己的自定义事件
        if (/^self/.test(type)) {
            if (!ele[type]) {
                ele[type] = [];
            }
            var a = ele[type];
            for (var i = 0; i < a.length; i++) {
                if (a[i] === fn) return;
            }
            a.push(fn);
        } else {
            //标准浏览器
            if (ele.addEventListener) {
                ele.addEventListener(type, fn, false);
            } else {
                //IE浏览器
                if (!ele[type + 'onEvent']) {
                    ele[type + 'onEvent'] = [];
                    ele.attachEvent('on' + type, processThis(run, ele));
                }
                var a = ele[type + 'onEvent'];
                for (var i = 0; i < a.length; i++) {
                    if (a[i] == fn) return;
                }
                a.push(fn);
            }
        }
    }

    function off(ele, type, fn) {
        //先判断自己的事件
        if (/^self/.test(type)) {
            var a = ele[type];
            if (a && a.length) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i] == fn) {
                        a[i] = null;
                        break;
                    }
                }
            }
        } else {
            //标准浏览器事件库
            if (ele.removeEventListener) {
                ele.removeEventListener(type, fn);
            } else {
                //IE浏览器
                var a = ele[type + 'onEvent'];
                if (a && a.length) {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i] == fn) {
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        }
    }

    function run() {
        //IE浏览器执行此方法
        var e = window.event;
        e.target = e.target || e.srcElement;
        e.pageX = (document.documentElement.scrollLeft || document.body.scrollLeft) + e.clientX;
        e.pageY = (document.documentElement.scrollTop || document.body.scrollTop) + e.clientY;
        e.preventDefault = function () {
            e.returnValue = false;
        };
        e.stopPropagation = function () {
            e.cancelBubble = true;
        };
        var a = this[e.type + 'onEvent'];
        if (a && a.length) {
            for (var i = 0; i < a.length; i++) {
                if (typeof a[i] === 'function') {
                    a[i].call(this, e);
                } else {
                    a.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function fire(ele, type, e) {
        var a = ele[type];
        if(a && a.length) {
            for(var i=0; i<a.length; i++) {
                if(typeof a[i]==='function') {
                    a[i].call(ele, e);
                }else {
                    a.splice(i, 1);
                    i--;
                }
            }
        }
    }

    function processThis(fn, context) {
        //改变this指向返回函数的定义阶段
        return function (e) {
            e = e || window.event;
            fn.call(context, e);
        }
    }

    window.ev = {
        on: on,
        off: off,
        run: run,
        processThis: processThis,
        fire: fire
    };
})();
