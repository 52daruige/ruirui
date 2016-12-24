function EventEmitter() {

}
EventEmitter.prototype.on = function (type, fn) {
    if (!this[type]) {
        this[type] = [];
    }
    var a = this[type];
    for (var i = 0; i < a.length; i++) {
        if (a[i] === fn) return
    }
    a.push(fn);
    return this;
};
EventEmitter.prototype.off = function (type, fn) {
    var a = this[type];
    if(a && a.length) {
        for(var i=0; i<a.length; i++) {
            if(a[i]==fn) {
                a[i] = null;
                break;
            }
        }
    }
};
EventEmitter.prototype.fire = function (type, e) {
    var a = this[type];
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
};

function Drag(ele) {
    this.ele = ele;
    this.x = this.y = this.l = this.t = null;
    this.MOVE = ev.processThis(this.move, this);
    this.UP = ev.processThis(this.up, this);
    this.DOWN = ev.processThis(this.down, this);
    ev.on(this.ele, 'mousedown', this.DOWN);
}
Drag.prototype = new EventEmitter;
Drag.prototype.constructor = Drag;
Drag.prototype.down = function (e) {
    this.x = e.clientX;
    this.y = e.clientY;
    this.l = this.ele.offsetLeft;
    this.t = this.ele.offsetTop;
    if (this.ele.setCapture) {
        this.ele.setCapture();
        ev.on(this.ele, 'mousemove', this.MOVE);
        ev.on(this.ele, 'mouseup', this.UP);
    } else {
        ev.on(document, 'mousemove', this.MOVE);
        ev.on(document, 'mouseup', this.UP);
    }
    e.preventDefault();
    this.fire('selfDown', e);
};
Drag.prototype.move = function (e) {
    var l = this.l + e.clientX - this.x;
    var t = this.t + e.clientY - this.y;
    this.ele.style.left = l + 'px';
    this.ele.style.top = t + 'px';
    this.fire('selfMove', e);
};
Drag.prototype.up = function (e) {
    if (this.ele.releaseCapture) {
        this.ele.releaseCapture();
        ev.off(this.ele, 'mousemove', this.MOVE);
        ev.off(this.ele, 'mouseup', this.UP);
    } else {
        ev.off(document, 'mousemove', this.MOVE);
        ev.off(document, 'mouseup', this.UP);
    }
    this.fire('selfUp', e);
};