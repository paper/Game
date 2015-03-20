/*
 * @Author paper
 * @Date: 2011-06-05
 * @Email: zhang.binjue@gmail.com
 * @introduce: 针对iphone4 safari 脚本封装 
 */

function FIP(){};

FIP.isTouch=(function(){
	return /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
})();

FIP.touchClick=FIP.isTouch ? 'touchstart' : 'click';

/*======== 等待DOM加载完毕后运行func =========*/
FIP.ready=function(func){
	document.addEventListener('DOMContentLoaded', function(){
   		func && func();    
    }, false);
};

/*======== 去除字符串两边的空格 =========*/
FIP.trim=function(s){
	if (typeof s === "string") { return s.replace(/^\s+|\s+$/g, ''); }
};

/*======== 隐藏导航栏 =========*/
FIP.hideURLbar=function(){
	setTimeout(function(){
		window.scrollTo(0, 1);
	},0);
};

/*======== 禁止页面被拖动 =========*/
FIP.stopPageDrag=function(){
	window.addEventListener('load',function(){
		FIP.hideURLbar();
		
        document.addEventListener('touchmove', function(e){
            e.preventDefault();
        }, false);
        document.addEventListener('touchstart', function(e){
           FIP.hideURLbar();
        }, false);
	},false);
};

/*============================================================
 * 阻止手势按住字体不动时，弹出的放大镜进行选择的默认行为 
 * 这段代码还会屏蔽click事件
 *============================================================*/
FIP.stopHandSelect=function(query){
	var r;
	
	if (query && typeof query !== 'string') {
		//一个节点，或者节点集合
		r=query.length ? Array.prototype.slice.call(query) : [query];
	} else {
		query = query || '.p-no-select';
		r=Array.prototype.slice.call(document.querySelectorAll(query));
	}
	
	r.map(function(elem){
		elem.addEventListener('touchstart', function(e){
			e.preventDefault();
		}, false);
	});
};

/*======== 得到DOM节点 =========*/
FIP.$id=function(elem){
	return typeof elem==='string'?document.getElementById(elem) : elem;
};

/*======== 显示 =========*/
FIP.show=function(elem){
	FIP.$id(elem).style.display="block";
	FIP.$id(elem).style.opacity=1;
};

/*======== 隐藏 =========*/
FIP.hide=function(elem){
	FIP.$id(elem).style.display="none";
};

/*======== 淡出 =========*/
FIP.fOut=function(elem,callback){
	var el=FIP.$id(elem),
		max=100;
	
	(function(){
		max-=10;
		if(max<=0){
			el.style.opacity=0.1;
			if(typeof callback==="undefined"){
				FIP.hide(el);
			}else{
				callback();
			}
			return;
		}
		el.style.opacity=max/100;
		setTimeout(arguments.callee,10);
	})()
};

/*======== 基本动画函数 =========*/
/*	
 *	t: current time（当前时间）；
 *	b: beginning value（初始值）；
 *	c: change in value（变化量）；
 *	d: duration（持续时间）
 
var Tween = {
		Linear: {
			noease: function(t, b, c, d){
				return c * t / d + b;
			}
		},
		Quad: {
			easeIn: function(t, b, c, d){
				return c * (t /= d) * t + b;
			},
			easeOut: function(t, b, c, d){
				return -c * (t /= d) * (t - 2) + b;
			},
			easeInOut: function(t, b, c, d){
				if ((t /= d / 2) < 1) return c / 2 * t * t + b;
				return -c / 2 * ((--t) * (t - 2) - 1) + b;
			}
		}
	};
================================*/
FIP.animate=(function(){

	function Tween_Quad_easeOut(t,b,c,d){return -c * (t /= d) * (t - 2) + b;};
		
	function animate(obj){
		 var Mceil=Math.ceil,
			elem = FIP.$id(obj.elem), 
	    	begin=obj.begin,	
	    	end=obj.end,					
	   		doingCallback = obj.doingCallback, 
	   		endCallback=obj.endCallback,
			time,
			v,
			t = 0, 
			b = begin, 
			c = end-begin, 
			d = obj.speed || 8;
		
			function animate_repeat(t,b,c,d){
				v=Mceil( Tween_Quad_easeOut(t,b,c,d) );
				doingCallback.call(elem,v);
				
				if (t < d) {
					t++;
					time = setTimeout(function(){
						t = t;
						b = v;
						c = end - b;

						animate_repeat(t, b, c, d);
					}, 15);
				}
				else {
					clearTimeout(time);
					if(v!=end){
						doingCallback.call(elem,end);
					}
					endCallback && endCallback.call(elem,v);
				}
			};
			
			animate_repeat(t,b,c,d);
	};
	
	return animate;
})();

/*======== 导入HTML 增强版innerHTML =========*/
FIP.asynInnerHTML=function(HTML, doingCallback, endCallback){
    var temp = document.createElement('div'), 
		frag = document.createDocumentFragment();
    temp.innerHTML = HTML;
    (function(){
        if (temp.firstChild) {
            frag.appendChild(temp.firstChild);
            doingCallback(frag);
            setTimeout(arguments.callee, 0);
        } else {
            endCallback && endCallback(frag);
        }
    })();
};

/*======== 创建Loading页面 =========*/
FIP.loading=(function(){
	var key=false,
		html='<div id="p_loading_wrapper" class="p-loading-wrapper" style="display:none;">'+
				'<div class="p-loading-main">'+
					'<div class="p-loading-box"><div class="p-loading-ball"></div></div>'+
					'<div class="p-msg" id="p_loading_wrapper_msg"></div>'+
				'</div>'+
				'<div class="p-loading-bg"></div>'+
			'</div>';
	
	return {
		createLoading:function(msg,wrapElem){
			if (!key) {
				key = true;
				
				//最好容器是包含在靠近body的id为body的div，而且给出它的宽度高度，溢出隐藏。
				var wrap=wrapElem || document.body.firstElementChild;
				
				FIP.asynInnerHTML(html, function(f){
					wrap.appendChild(f);
				}, function(){
					FIP.$id('p_loading_wrapper_msg').innerHTML=msg || 'Loading...';
					FIP.stopHandSelect('#p_loading_wrapper_msg');
					
					FIP.show('p_loading_wrapper');
				});
			}else{
				//如果再次调用的话，可以用来改变loading的文字	
				if(FIP.$id('p_loading_wrapper_msg')){
					FIP.$id('p_loading_wrapper_msg').innerHTML=msg || 'Loading...';
				}
			}
		},
		
		removeLoading:function(callback,fOutBoolean){
			if (key) {
				(function(){
					if (FIP.$id('p_loading_wrapper')) {
						var el = FIP.$id('p_loading_wrapper'),
							el_parent=el.parentNode;
						
						setTimeout(function(){
							if (fOutBoolean === false) {
								el_parent.removeChild(el);
								key = false;
								callback && callback();
							} else {
								FIP.fOut(el, function(){
									el_parent.removeChild(el);
									key = false;
									callback && callback();
								});
							}
						},200);
						
						return;
					}
					
					setTimeout(arguments.callee,50);
				})()
			}
		}//removeLoading
	}
})();

/*
 * The second way to load external JavaScript
 *
 * @param {Array.<string>} urls
 * @param {Function} loadingCallback
 * @param {Function} doneCallback
 */
FIP.loadScriptEx = (function(){
    var head = document.getElementsByTagName("head")[0];
    var cache = [];

    //检验url这个脚本地址是否已经存在cache里面
    //存在返回true，不存在返回false
    function checkCache(url, r){
        if (r.length == 0) return false;
        
        for (var i = 0, len = r.length; i < len; i++) {
            if (url == r[i]) return true;
        }
        
        return false;
    };
    
    //loadingCallback,和doneCallback都只能做一次
    return function(urls, loadingCallback, doneCallback){		
        var len = urls.length;
        var i = 0;
        var loadingCallbackKey = true;
        
        //加载1个js的函数
        function loadjs(url, loadingCallback, doneCallback){
            //脚本加载完毕
            function done(){
                cache.push(url + '-loadingDone');
                if (typeof doneCallback == 'function') doneCallback();
            };
            
            //保证loadingCallback能够加载且仅加载一次
            function loading(){
                if (loadingCallbackKey && typeof loadingCallback == 'function') {
                    loadingCallbackKey = false;
                    loadingCallback();
                }
            };
            
            //首先判断这个js是不是已经存在,
            if (checkCache(url, cache)) {
                //是不是加载完毕，还是正在加载...
                if (checkCache(url + '-loadingDone', cache)) {
                    if (typeof doneCallback == 'function') doneCallback();
                    return;
                } else {
                    (function(){
                        if (!checkCache(url + '-loadingDone', cache)) {
                            loading();
							//防止进程被卡死
                            setTimeout(arguments.callee, 10);
                        } else {
                            if (typeof doneCallback == 'function') doneCallback();
                            return;
                        }
                    })()
                }
            } else {
                var script = document.createElement("script");
                script.type = "text/javascript";
                
                loading();
                
                if (script.readyState) {
                    script.onreadystatechange = function(){
                        if (script.readyState == "loaded" || script.readyState == "complete") {
                            script.onreadystatechange = null;
                            done();
                        }
                    };
                } else {
                    script.onerror = function(){
                        done();
                        throw new Error('Oops~,maybe script\'s url is wrong!Check it!');
                    };
                    script.onload = function(){
                        done();
                    };
                }
                
                script.src = url;
                head.appendChild(script);
                cache.push(url);
            }
        };
        
        (function(){
            var fn = arguments.callee;
            
            if (i == len - 1) {
                loadjs(urls[i], loadingCallback, doneCallback);
                return;
            } else {
                loadjs(urls[i], loadingCallback, function(){
                    i++;
                    setTimeout(fn, 0);
                });
            }
        })()
    };
})();

/*======== Ajax =========*/
FIP.ajax = function(obj){
	if (!obj.url) return;
	var xmlhttp = new XMLHttpRequest(),
		type = obj.type || 'get', 
		asyn = obj.asyn || true,
		beforeFunc=obj.before,
		successFunc=obj.success,
		stopFunc=obj.stop;
		
    xmlhttp.open(type, obj.url, asyn);
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState != 4) {
         	beforeFunc && beforeFunc();
        } else {
            if (xmlhttp.status == 200) {
                successFunc(FIP.trim(xmlhttp.responseText));
            } else {
                alert("Error: status code is " + xmlhttp.status);
            }
        }
    };
    
	//cancel ajax request
    if (typeof stopFunc==='function') {
        var time = obj.time || 10000;
        setTimeout(function(){
            if (xmlhttp.readyState != 4) {
                xmlhttp.abort();
                stopFunc();
                return;
            }
        }, time);
    }
	
    if (type == 'post') {
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("Connection", "close");
        xmlhttp.send(obj.params);
    } else {
        xmlhttp.send(null);
    }
};

/*===================
 * 计时
 * 7键游戏就不用这个函数了，以后的代码都用这个函数
 ===================*/
FIP.GetTime=function(getTime_min_id,getTime_sec_id){
	this.getTime_min=document.getElementById(getTime_min_id) || getTime_min_id ;
	this.getTime_sec=document.getElementById(getTime_sec_id) || getTime_sec_id ;
	this.T;
	this.t=-1;
	this.min=0;
	this.sec=0;
};

FIP.GetTime.prototype.getMin=function(t){
	var m=parseInt(t/60,10);
	return m<10 ? ('0'+m) : m;
};

FIP.GetTime.prototype.getSec=function(t){
	var s=t%60;
	return s<10 ? ('0'+s) : s;
};

FIP.GetTime.prototype.startTime = function(){
	var that=this;
	
	(function(){
		that.t++;
		that.getTime_min.innerHTML = that.getMin(that.t);
		that.getTime_sec.innerHTML = that.getSec(that.t);
		
		that.T = setTimeout(arguments.callee, 1000);
	})();
};

FIP.GetTime.prototype.resetTime=function(){
	this.clearTime();
	this.startTime();
};
FIP.GetTime.prototype.stopTime=function(){
	clearTimeout(this.T);
};
FIP.GetTime.prototype.continueTime=function(){
	this.stopTime();
	this.startTime();
};
//重置时间，但是不自动开始
FIP.GetTime.prototype.clearTime=function(){
	clearTimeout(this.T);
	this.getTime_min.innerHTML="00";
	this.getTime_sec.innerHTML="00";
			
	this.t=-1;this.min=0;this.sec=0;
};

