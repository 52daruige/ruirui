/**
 * 订阅发布的类
 * 三个方法:on、off、fire
 * @constructor
 */
function EventEmitter() {
}
//订阅...this指向当前实例
//现在变成订阅发布类，参数：需要传递type,fn
//订阅函数
EventEmitter.prototype.on = function (type, fn) {
    //构造函数中，操作的都是this实例
    //自己的自定义事件，将自己的自定义事件保存在实例的私有属性上this->当前实例
    if (!this[type]) {
        this[type] = [];
    }
    var a = this[type];
    //对当前的方法进行判断，相同的方法不在进行push
    for (var i = 0; i < a.length; i++) {
        if (a[i] === fn) return;
    }
    //将方法保存在实例的私有数组中
    a.push(fn);
    //返回实例：增加链式操作
    return this;
};

//解除订阅函数
EventEmitter.prototype.off = function (type, fn) {
    var a = this[type];
    if (a && a.length) {
        for (var i = 0; i < a.length; i++) {
            //删除的时候，默认的将当前行为赋值为null
            if (a[i] === fn) {
                a[i] = null;
                break;
            }
        }
    }
};

//订阅的发布函数，负责对已经订阅的函数，进行调用
//这个函数里，要将被调用的方法的this指向改成当前实例，同时将e事件对象传递出去
EventEmitter.prototype.fire = function (type, e) {
    var a = this[type];
    if (a && a.length) {
        for (var i = 0; i < a.length; i++) {
            //因为off里将某些方法赋值成null，所以发布方法需要对当前的方法的类型进行判断
            if (typeof a[i] === 'function') {
                //对自定义事件进行调用，同时改变其this指向改变为当前实例，并将事件对象传递出去
                a[i].call(this, e);
            } else {
                a.splice(i, 1);
                i--;
            }
        }
    }
};

/**
 * Drag类： 参数：元素
 * @param ele
 * @constructor
 */
function Drag(ele) {
    if (!ele) return;
    //将属性保存在实例的私有属性中，即this...this-->代表当前类的实例
    this.ele = ele;
    this.x = this.y = this.l = this.t = null;
    //给元素绑定mousedown事件，注意：方法中的this指向，this指向全部指向实例
    //ev.on为系统的事件绑定，给元素绑定事件的方法，它会将方法的this指向变成--->当前元素，所以我们要手动将当前方法的this指向变成当前实例this
    //改变后的this指向的方法，保存在实例的私有属性上
    this.DOWN = ev.processThis(this.down, this);
    this.MOVE = ev.processThis(this.move, this);
    this.UP = ev.processThis(this.up, this);
    ev.on(this.ele, 'mousedown', this.DOWN);
}
//继承EventEmitter类的方法
Drag.prototype = new EventEmitter;
//改变当前类的constructor指向
Drag.prototype.constructor = Drag;
Drag.prototype.down = function (e) {
    e = e || window.event;
    //记录当前元素的位置，保存在元素的私有属性上
    this.x = e.clientX;
    this.y = e.clientY;
    this.l = this.ele.offsetLeft;
    this.t = this.ele.offsetTop;
    //同时调用move和up方法，注意：不同浏览器的兼容性
    //IE浏览器
    if (this.ele.setCapture) {
        this.ele.setCapture();
        ev.on(this.ele, 'mousemove', this.MOVE);
        ev.on(this.ele, 'mouseup', this.UP);
    } else {
        //标准浏览器的事件调用
        ev.on(document, 'mousemove', this.MOVE);
        ev.on(document, 'mouseup', this.UP);
        //同时注意阻止默认事件的发生
        e.preventDefault();
    }
    //发布
    this.fire('selfDown', e);
};
Drag.prototype.move = function (e) {
    e = e || window.event;
    //求出当前元素的left和top值
    this.left = this.l + e.clientX - this.x;
    this.top = this.t + e.clientY - this.y;
    //求出当前元素的最大移动位置
    var maxL = utils.win('clientWidth') - this.ele.offsetWidth;
    var maxT = utils.win('clientHeight') - this.ele.offsetHeight;
    //对当前元素的移动范围进行限制
    // if (this.left >= maxL) {
    //     this.left = maxL;
    // } else if (this.left <= 0) {
    //     this.left = 0;
    // }
    // if (this.top >= maxT) {
    //     this.top = maxT;
    // } else if (this.top <= 0) {
    //     this.top = 0;
    // }
    //给当前元素的left和top赋值
    this.ele.style.left = this.left + 'px';
    this.ele.style.top = this.top + 'px';
    //在move方法下进行fire的发布调用
    this.fire('selfMove', e);
};
Drag.prototype.up = function () {
    //区分不同的浏览器的解绑方法
    if (this.ele.releaseCapture) {
        this.ele.releaseCapture();
        ev.off(this.ele, 'mousemove', this.MOVE);
        ev.off(this.ele, 'mouseup', this.UP);
    } else {
        ev.off(document, 'mousemove', this.MOVE);
        ev.off(document, 'mouseup', this.UP);
    }
    //发布
    this.fire('selfUp');
};
//升级1：限定范围的拖拽
Drag.prototype.range = function (opt) {
    //将当前的参数，保存到实例的私有属性上，以便后续使用
    this.opt = opt;
    //这里进行订阅，不用考虑当前方法的this指向，当fire调用的时候，会将当前的方法的this指向修改成当前实例
    this.on('selfMove', this.addRange);
};
Drag.prototype.addRange = function () {
    //fire调用的时候，会修改当前方法的this指向为当前实例，同时传递e事件对象，该事件对象已做兼容处理
    if (this.left >= this.opt.right) {
        this.left = this.opt.right;
    } else if (this.left <= this.opt.left) {
        this.left = this.opt.left;
    }
    if (this.top >= this.opt.bottom) {
        this.top = this.opt.bottom;
    } else if (this.top <= this.opt.top) {
        this.top = this.opt.top;
    }
    this.ele.style.left = this.left + 'px';
    this.ele.style.top = this.top + 'px';
};
Drag.prototype.border = function () {
    this.on('selfDown', this.bor);
    this.on('selfUp', this.bord);
};
Drag.prototype.bor = function () {
    this.ele.bgColor = utils.getCss(this.ele, 'background');
    this.ele.inn = this.ele.innerHTML;
    this.ele.innerHTML = '';
    if (this.ele.index == utils.rnd(0, 11)) {
        this.ele.style.background = 'url("../img/100.png") no-repeat center';
    } else {
        this.ele.style.background = 'transparent';
    }
    this.ele.style.border = '1px dashed black';
};
Drag.prototype.bord = function () {
    this.ele.style.background = this.ele.bgColor;
    this.ele.style.border = 'none';
    this.ele.innerHTML = this.ele.inn;
};
Drag.prototype.play = function () {
    //物体的横向弹弹
    //在这里对物体的横向弹弹进行订阅
    this.on('selfDown', this.clearEffect);
    this.on('selfMove', this.getSpeedX);
    this.on('selfUp', this.fly);
    this.on('selfUp', this.drop);
};

Drag.prototype.clearEffect = function () {
    //关闭定时器
    clearTimeout(this.ele.flyTimer);
    //清空prev的值
    this.ele.prev = null;
};

Drag.prototype.getSpeedX = function (e) {
    //通过move方法在短暂的时间内移动的距离作为当前元素弹弹运动的速度
    if (!this.ele.speedX) {
        this.ele.speedX = e.clientX;
    } else {
        this.ele.speedX = e.clientX - this.ele.prev;
        this.ele.prev = e.clientX;
    }
};

Drag.prototype.fly = function () {
    //关闭定时器
    clearTimeout(this.ele.flyTimer);
    //摩擦阻力
    this.ele.speedX *= 0.93;
    //得到通过速度移动的距离
    var l = this.ele.offsetLeft + this.ele.speedX;
    //移动到边界的时候进行反弹
    var maxL = utils.win('clientWidth') - this.ele.offsetWidth;
    if (l >= maxL) {
        l = maxL;
        this.ele.speedX *= -1;
    } else if (l <= 0) {
        l = 0;
        this.ele.speedX *= -1;
    }
    //达到一定值后，才让元素进行运动，以便关闭定时器
    if (Math.abs(this.ele.speedX) > 0.5) {
        this.ele.style.left = l + 'px';
        this.ele.flyTimer = setTimeout(ev.processThis(this.fly, this), 10);
    }
};
Drag.prototype.drop = function () {
    clearTimeout(this.ele.dropTimer);
    if (!this.ele.speedY) {
        this.ele.speedY = 9.8;
    } else {
        this.ele.speedY += 9.8;
    }
    this.ele.speedY *= 0.93;
    var t = this.ele.offsetTop + this.ele.speedY;
    var maxT = utils.win('clientHeight') - this.ele.offsetHeight;
    if (t >= maxT) {
        t = maxT;
        this.ele.speedY *= -1;
        this.ele.tmp++;
    } else {
        this.ele.tmp = 0;
    }
    if (this.ele.tmp < 2) {
        this.ele.style.top = t + 'px';
        this.ele.dropTimer = setTimeout(ev.processThis(this.drop, this), 10);
    }
};
Drag.prototype.photo = function (aEle) {
    this.aEle = aEle;
    //订阅
    this.on('selfDown', this.creaseIndex);
    this.on('selfMove', this.hited);
    this.on('selfUp', this.changePos);
};
Drag.prototype.zIndex = 0;
Drag.prototype.creaseIndex = function () {
    this.ele.style.zIndex = ++Drag.prototype.zIndex;
};
Drag.prototype.isHited = function (r, l) {
    //用相反的方向来判断
    //先来判断它没有碰到是什么情况
    if (r.offsetLeft + r.offsetWidth < l.offsetLeft || r.offsetTop + r.offsetHeight < l.offsetTop || r.offsetLeft > l.offsetLeft + l.offsetWidth || r.offsetTop > l.offsetTop + l.offsetHeight) {
        return false;
    } else {
        return true;
    }
};
Drag.prototype.hited = function () {
    this.ary = [];
    for (var i = 0; i < this.aEle.length; i++) {
        var oLi = this.aEle[i];
        if (this.ele == oLi) continue;
        if (this.isHited(this.ele, oLi)) {
            oLi.style.background = 'red';
            this.ary.push(oLi);
        } else {
            oLi.style.background = oLi.oldColor;
        }
    }
};
Drag.prototype.changePos = function () {
    //得到相撞的元素
    var a = this.ary;
    if (a && a.length) {
        for (var i = 0; i < a.length; i++) {
            var oLi = a[i];
            //当前元素回到原来的位置后，需要将刚才碰撞到的元素的background赋值为oldColor
            oLi.style.background = oLi.oldColor;
            //计算...当前元素和每个相撞的li元素之间的距离
            oLi.dis = Math.pow(this.ele.offsetLeft - oLi.offsetLeft, 2) + Math.pow(this.ele.offsetTop - oLi.offsetTop, 2);
        }
        //将数组中的dis从小到大排序
        a.sort(function (a, b) {
            return a.dis - b.dis;
        });
        //提取出来最小的dis
        var shortDis = a[0];
        this.ele.style.background = 'purple';
        shortDis.style.background = 'purple';
        //让当前元素和最短的元素以运动的形式移动到对方的位置上
        animate({id: this.ele, target: {left: shortDis.l, top: shortDis.t}, duration: 500, effect: 3});
        animate({id: shortDis, target: {left: this.ele.l, top: this.ele.t}, duration: 500, effect: 3});
        //同时改变当前元素的left和top值
        var l = this.ele.l, t = this.ele.t;
        this.ele.l = shortDis.l, this.ele.t = shortDis.t;
        shortDis.l = l, shortDis.t = t;
        //在清空碰撞到的数组
        this.ary = [];
    } else {
        //将物体移动回原来的位置
        animate({id: this.ele, target: {left: this.ele.l, top: this.ele.t}, duration: 500, effect: 3});
    }

};

