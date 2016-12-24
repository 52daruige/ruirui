var utils = (function () {
    var flag = 'getComputedStyle' in window;
    //1.getByClass：通过传入的className值，取得当前父标签容器下含有同名的标签    参数：字符串值 容器标签    返回值：数组
    function getByClass(strClass, parent) {
        parent = parent || document;
        if(flag) return makeArray(parent.getElementsByClassName(strClass));
        //先对字符串进行处理
        var ary = strClass.replace(/(^ +)|( +$)/g, '').split(/\s+/g);
        //获得当前父容器下的所有标签
        var nodelist = parent.getElementsByTagName('*');
        //如果含有该值的，则将其取出来存于数组中
        var aValue = [];
        for( var i=0; i<nodelist.length; i++) {
            var cur = nodelist[i];
            //先假设当前的字符串数组的值都符合，如果遇到一个不符合的，bOk设置为false，就直接break掉
            var bOk = true;
            //双循环判断当前的值是否存在于className上
            for(var j=0; j<ary.length; j++) {
                //用正则验证当前的值是否存在于className值中
                var reg = new RegExp('(^| +)' + ary[j] + '( +|$)', 'g');
                if(!reg.test(cur.className)) {
                    bOk = false;
                    break;
                }
            }
            if(bOk) ary.push(cur);
        }
        return ary;
    }
    //2.hasClass：判断一个className的值是否存在于一个标签中  参数：curEle cName 返回值：布尔值
    function hasClass(curEle, cName) {
        //用正则的方法进行验证是否存在
        var reg = new RegExp('(^| +)'+ cName +'( +|$)','g');
        return reg.test(curEle.className);
    }
    //3.addClass：给一个标签添加className类  参数：当前元素 strClass    返回值：无
    //可以添加多个className值，也可以添加一个，添加之前先判断该值是否存在于当前标签中
    function addClass(curEle, strClass) {
        //先对字符串进行处理，将字符串分成了一组一组的
        var aStr = strClass.replace(/(^ +)|( +$)/g, '').split(/\s+/g);
        for(var i=0; i<aStr.length; i++) {
            if(!hasClass(curEle, aStr[i])) {
                curEle.className += ' ' + aStr[i];
            }
        }

    }
    //4.removeClass：从当前元素中移除出去，传入的值        参数：curEle strClass   返回值：无
    //可以移除一个或者多个，移除时记得对className值的空格进行优化处理
    function removeClass(curEle, strClass) {
        var aryStr = strClass.replace(/(^ +)|( +$)/g, '').split(/\s+/g);
        for (var i=0; i<aryStr.length; i++) {
            if(hasClass(curEle, aryStr[i])) {
                var reg = new RegExp('(^| +)'+ aryStr[i] +'( +|$)','g');
                curEle.className = curEle.className.replace(reg, ' ').replace(/(^ +)|( +$)/g, '').replace(/\s+/g, ' ');
            }
        }
    }
    //5.getCss：设置或者获取当前元素的一个非行间样式   参数：curEle attr 返回值：返回指定css样式的值
    function getCss(curEle, attr) {
        var val = null;
        var reg = null;
        if(flag) {
            val = getComputedStyle(curEle, null)[attr];
        }else {
            if(attr == 'opacity') {
                val = curEle.currentStyle.filter;
                reg = /^alpha\(opacity[:=](\d+(\.\d+)?)\)$/g;
                return reg.test(val) ? RegExp.$1/100 : 1;
            }
            val = curEle.currentStyle[attr];
        }
        //....width出现一次错误
        reg = /^(height|width|left|right|bottom|top|((margin|padding)(left|top|right|bottom)?))$/gi;
        return reg.test(attr) ? parseFloat(val) : val;
    }
    //6.setCss：给当前元素设置一个行内样式，如果值有单位的话，用传进来的值，没有单位的话默认PC端的px像素值
    //参数:curEle attr value        返回值：无
    function setCss(curEle, attr, value) {
        //升级1：设置透明度
        if(attr == 'opacity') {
            curEle.style[attr] = value;
            curEle.style.filter = 'alpha(opacity = ' + value * 100 + ')';
            return;
        }
        //升级2：设置浮动值
        if(attr == 'float') {
            curEle.style.cssFloat = value;
            curEle.style.styleFloat = value;
            return;
        }
        //用正则检查传进来的值
        var reg = /^([-+]?)(\d+(\.\d+)?)(px|pt|em|rem|%)?$/g;
        if(reg.test(value)) {
            if(!isNaN(value)) {
                //默认进行px单位操作
                value = value + 'px';
            }
        }
        curEle.style[attr] = value;
    }
    //7.setGroupCss：设置一组样式  参数：curELe object 返回值：无
    function setGroupCss(curEle, opt) {
        if(Object.prototype.toString.call(opt) !== '[object Object]') return;
        for(var attr in opt) {
            setCss(curEle, attr, opt[attr]);
        }
    }
    //8.win：设置或者获取当前窗体的值    参数：attr value
    function win(attr, value) {
        if(!value) {
            return document.documentElement[attr] || document.body[attr];
        }
        document.documentMode[attr] = document.body[attr] = value;
    }
    //9,offset：当前元素到body的left和top值
    function offset(curEle) {
        var par = curEle.offsetParent;
        var l = curEle.offsetLeft;
        var t = curEle.offsetTop;
        while(par) {
            if(flag) {
                l += curEle.clientLeft;
                t += curEle.clientTop;
            }
            l += curEle.offsetLeft;
            t += curEle.offsetTop;
            par = par.offsetParent;
        }
        return {left: l, top: t};
    }
    //10.css：设置一个、一组样式，或者获取样式
    //第二个参数，可能是对象或者字符串
    function css(curEle) {
        var argTwo = arguments[1];
        if(typeof argTwo === 'string') {
            var argThree = arguments[2];
            if(!argThree) {
                return getCss(curEle, argTwo);
            }else {
                setCss(curEle, argTwo, argThree);
            }
        }
        if(Object.prototype.toString.call(argTwo) === '[object Object]') setGroupCss(curEle, argTwo);
    }
    //11.getChildren：可以通过传入的标签名得到指定的元素的所有同名标签子元素，如果没有传标签名，则返回当前元素的所有子元素
    //参数：curEle tagName 返回值：数组
    function getChildren(curEle, tagName) {
        var nodes = curEle.childNodes;
        var ary = [];
        for(var i=0; i<nodes.length; i++) {
            var cur = nodes[i];
            if(cur.nodeType == 1) {
                if(tagName) {
                    if(cur.tagName.toLowerCase() == tagName.toLowerCase()) {
                        ary.push(cur);
                    }
                }else {
                    ary.push(cur);
                }
            }
        }
        return ary;
    }
    //12.prev：获取上一个哥哥元素  参数：当前元素     返回值：哥哥元素
    function prev(curEle) {
        if(flag) {
            return curEle.previousElementSibling;
        }
        var pre = curEle.previousSibling;
        while(pre && pre.nodeType !==1) {
            pre = pre.previousSibling;
        }
        return pre;
    }
    //13.next：获取当前元素的弟弟元素   参数：当前元素     返回值：弟弟元素
    function next(curEle) {
        if(flag) return curEle.nextElementSibling;
        var nex = curEle.nextSibling;
        while(nex && nex.nodeType !==1) {
            nex = nex.nextSibling
        }
        return nex;
    }
    //14.sibling：获取当前元素的哥哥元素和弟弟元素   参数：当前元素     返回值：一个数组
    function sibling(curEle) {
        var pre = this.prev(curEle);
        var nex = this.next(curEle);
        var ary = [];
        if(pre) ary.push(pre);
        if(nex) ary.push(nex);
        return ary;
    }
    //15.prevAll：获取当前元素的所有哥哥元素      参数：当前元素 返回值：数组
    function prevAll(curEle) {
        var ary = [];
        var pre = this.prev(curEle);
        while(pre) {
            ary.push(pre);
            pre = this.prev(pre);   //这里的参数写错
        }
        return ary;
    }
    //16.nextAll：获取当前元素的所有弟弟元素  参数：当前元素 返回值：数组
    function nextAll(curEle) {
        var ary = [];
        var nex = this.next(curEle);
        while(nex) {
            ary.push(nex);
            nex = this.next(nex);
        }
        return ary;
    }
    //17.siblings：获取当前元素的所有哥哥元素和弟弟元素       参数：当前元素      返回值：数组
    function siblings(curEle) {
        var ary1 = this.prevAll(curEle);
        var ary2 = this.nextAll(curEle);
        return ary1.concat(ary2);
    }
    //18.firstChild：获取当前父级标签下的第一个子标签    参数:父级标签     返回值：第一个子标签
    function firstChild(parent) {
        var children = this.getChildren(parent);
        return children[0];
    }
    //19.lastChild：当前容器的最后一个标签      参数：父级标签容器       返回值：最后一个标签
    function lastChild(parent) {
        var children = this.getChildren(parent);
        return children[children.length - 1];
    }
    //20.index：获取当前元素的索引    参数：当前元素     返回值：索引
    function index(curEle) {
        //获取当前元素的所有哥哥元素，然后数组的长度就是当前元素的索引
        return this.prevAll(curEle).length;
    }
    //21.appendChild：在当前容器下增加一个元素   参数：当前元素 父元素 返回值：无
    function appendChild(curEle, parent) {
        parent.appendChild(curEle);
    }
    //22.prependChild：将当前元素插入到父容器第一个位置  参数：当前元素 父容器 返回值：无
    function prependChild(curEle, parent) {
        //先获取父容器的第一个子元素
        var firstEle = this.firstChild(parent);
        //如果第一个子元素存在，添加到它前面，如果没有存在则插入到末尾
        if(firstEle) {
            parent.insertBefore(curEle, firstEle);
        }else {
            parent.appendChild(curEle);
        }
    }
    //23.insertBefore：将当前元素插入到某个元素前面    参数：当前元素 另外一个元素  返回值：无
    function insertBefore(curEle, oldEle) {
        oldEle.parentNode.insertBefore(curEle, oldEle);
    }
    //24.insertAfter：将当前元素插入到旧元素的后边  参数：当前元素 旧元素 返回值：无
    function insertAfter(curEle, oldEle) {
        var nex = this.next(oldEle);
        if(nex) {
            oldEle.parentNode.insertBefore(curEle, nex);
        }else {
            oldEle.parentNode.appendChild(curEle);
        }
    }
    //25.makeArray：类数组转数组   参数：类数组  返回值：数组
    function makeArray(arg) {
        if(flag) return Array.prototype.slice.call(arg);
        var ary = [];
        for(var i=0; i<arg.length; i++) {
            ary.push(arg[i]);
        }
        return ary;
    }
    //26.myJSONParse：对JSON类型的数据进行解析 参数:JSON字符串  返回值：解析好的数据
    function myJSONParse(jsonStr) {
        return 'JSON' in window ? JSON.parse(jsonStr) : eval('(' + jsonStr + ')');
    }
    //27.rnd：取得一个给定区间内的随机整数     参数：n,m 两个整数，代表一个区间      返回值：取好的值
    function rnd(n, m) {
        n = Number(n);
        m = Number(m);
        if(isNaN(n) || isNaN(m)) {
            return Math.random();
        }
        if(m<n) {
            var tmp = n;
            n = m;
            m = tmp;
        }
        return Math.round(Math.random() * (m - n) + n);
    }
    return {
        //1.getByClass
        getByClass:getByClass,
        //2.hasClass
        hasClass:hasClass,
        //3.addClass
        addClass:addClass,
        //4.removeClass
        removeClass:removeClass,
        //5.getCss
        getCss:getCss,
        //6.setCss
        setCss:setCss,
        //7.setGroupCss
        setGroupCss:setGroupCss,
        //8.css
        css:css,
        //9.win
        win:win,
        //10.offset
        offset:offset,
        //11.getChildren
        getChildren:getChildren,
        //12.prev
        prev:prev,
        //13.next
        next:next,
        //14.sibling
        sibling:sibling,
        //15.prevAll
        prevAll:prevAll,
        //16.nextAll
        nextAll:nextAll,
        //17.siblings
        siblings:siblings,
        //18.firstChild
        firstChild:firstChild,
        //19.lastChild
        lastChild:lastChild,
        //20.index
        index:index,
        //21.appendChild
        appendChild:appendChild,
        //22.prependChild
        prependChild:prependChild,
        //23.insertBefore
        insertBefore:insertBefore,
        //24.insertAfter
        insertAfter:insertAfter,
        //25.makeArray
        makeArray:makeArray,
        //26myJSONParse
        myJSONParse:myJSONParse,
        //27.rnd
        rnd:rnd
    }
})()