class EventEmitter {
    constructor(){}
    //订阅发布类
    //on订阅方法，类里操作的都是实例this
    on(type, fn) {
        if(!this[type]) {
            this[type] = [];
        }
        var a = this[type];
        for(var i=0; i<a.length; i++) {
            if(a[i]===fn) return;
        }
        a.push(fn);
        //返回this增加链式操作
        return this;
    }
    //fire发布方法
    fire(type, e) {
        e = e || window.event;
        let a = this[type];
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
    //off解除订阅方法
    off(type, fn) {
        var a = this[type];
        if(a && a.length) {
            for(var i=0; i<a.length; i++) {
                if(a[i]===fn) {
                    a[i] = null;
                    break;
                }
            }
        }
    }
}
var zIndex = 0;
class Drag extends EventEmitter {
    constructor(ele){
        //对父级构造函数的调用是必须的
        super();
        this.ele = ele;
        this.x = this.y = this.l = this.t = null;
        this.MOVE = ev.processThis(this.move, this);
        this.DOWN = ev.processThis(this.down, this);
        this.UP = ev.processThis(this.up, this);
        //调用ev.on方法，进行事件的绑定
        ev.on(this.ele, 'mousedown', this.DOWN);
    }
    //始终确保方法内的this指向是实例
    down(e) {
        //按下时计算出当前元素的位置
        this.x = e.clientX;
        this.y = e.clientY;
        this.l = this.ele.offsetLeft;
        this.t = this.ele.offsetTop;
        //并调用move和up方法，注意浏览器的兼容性
        if(this.ele.setCapture) {  //IE
            this.ele.setCapture();
            ev.on(this.ele, 'mousemove', this.MOVE);
            ev.on(this.ele, 'mouseup', this.UP);
        } else { //chrome
            ev.on(document, 'mousemove', this.MOVE);
            ev.on(document, 'mouseup', this.UP);
        }
        //相当重要：阻止默认事件的发生
        e.preventDefault();
        this.fire('selfDown', e);
    }
    move(e) {
        var l = this.l + e.clientX - this.x;
        var t = this.t + e.clientY - this.y;
        this.ele.style.left = l + 'px';
        this.ele.style.top = t + 'px';
        this.fire('selfMove', e);
    }
    up() {
        //IE
        if(this.ele.releaseCapture) {
            this.ele.releaseCapture();
            ev.off(this.ele, 'mousemove', this.MOVE);
            ev.off(this.ele, 'mouseup', this.UP);
        }else {
            //chrome
            ev.off(document, 'mousemove', this.MOVE);
            ev.off(document, 'mouseup', this.UP);
        }
        this.fire('selfUp');
    }
    photo(aEle){
        this.aEle = aEle;
        this.on('selfDown', this.creaseIndex);
        this.on('selfMove', this.hited);
        this.on('selfUp', this.changePos);
    }
    creaseIndex(){
        this.ele.style.zIndex = ++zIndex ;
    }
    isHited(r,l){
        if (r.offsetLeft + r.offsetWidth < l.offsetLeft || r.offsetTop + r.offsetHeight < l.offsetTop || r.offsetLeft > l.offsetLeft + l.offsetWidth || r.offsetTop > l.offsetTop + l.offsetHeight) {
            return false;
        } else {
            return true;
        }
    }
    hited(){
        var aLi = this.aEle;
        this.ary = [];
        for(var i=0; i<aLi.length; i++) {
            var oLi = aLi[i];
            if(this.ele===oLi) continue;
            if(this.isHited(this.ele,oLi)) {
                oLi.style.background = 'red';
                this.ary.push(oLi);
            }else {
                oLi.style.background = oLi.oldColor;
            }
        }
    }
    changePos(){
        var a = this.ary;
        if(a && a.length) {
            for(var i=0; i<a.length; i++) {
                var oLi = a[i];
                oLi.style.background = oLi.oldColor;
                oLi.dis = Math.pow(this.ele.offsetLeft - oLi.offsetLeft, 2) + Math.pow(this.ele.offsetTop - oLi.offsetTop, 2);
            }
            a.sort(function (a, b) {
                return a.dis - b.dis;
            });
            var shotDis = a[0];
            animate({id: this.ele, target: {left: shotDis.l, top: shotDis.t}, effect: 3, duration: 500});
            animate({id: shotDis, target: {left: this.ele.l, top: this.ele.t}, effect: 3, duration: 500});
            var l = this.ele.l, t = this.ele.t;
            this.ele.l = shotDis.l, this.ele.t = shotDis.t;
            shotDis.l = l, shotDis.t = t;
            this.ary = [];
        }else {
            animate({id: this.ele, target: {left: this.ele.l, top: this.ele.t}, effect:3, duration:500});
        }
    }
    border(){
        this.on('selfDown', this.borPic);
        this.on('selfUp', this.relBor);
    }
    borPic(){
        var oImg = this.ele.getElementsByTagName('img')[0];
        this.ele.oImg = oImg;
        this.ele.oImg.oldSrc = oImg.getAttribute('src');
        this.ele.oImg.src = 'img/100.png';
    }
    relBor(){
        this.ele.oImg.src = this.ele.oImg.oldSrc;
    }
}