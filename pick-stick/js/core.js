var STATUS = {
  BEGIN : 0,
  
  INIT : 1,
  
  INITEND : 2,
  
  START : 3,
  
  SUCCESS : 4,
  
  REST : 5
};

var Game = {
  
  status : 0,
  
  init : function(){
    
    Game.status = STATUS.INIT;
    
    StickOption.store = Game.createSticksData(StickOption.number);
  
    //console.log( StickOption.store );
    
    Game.initSticksCompare();
    
    StickOption.up = Game.updateSticksCompare();
    
    Game.bindUserTouch();
    
    Game.drawSticks();
    
    Game.status = STATUS.INITEND;
  },
  
  start : function(){
    Game.reset();
    Game.init();
    
    Game.Score.reset();
    Game.Time.start();
    
    Game.status = STATUS.START;
  },
  
  isSuccess : function(){
    return Game.status === STATUS.START && StickOption.store.length === 0;
  },
  
  success : function( callback ){
    Game.Time.pause();
    
    var time = Game.Time.get();
    var score = Game.Score.get();
    
    Game.status = STATUS.SUCCESS;
    
    callback && callback(score, time.sec, time.msec);
  },
  
  reset : function( callback ){
    clearCanvas();
    StickOption.store.length = 0;
    StickOption.up.length = 0;
    
    Game.status = STATUS.REST;
    
    callback && callback();
  },
  
  /**
    开始计时
  */
  Time : {
    
    t : 0,
    
    step : 100,
    
    key : true,
    
    start : function(){
      var self = this;
      
      self.reset();
      
      function fn(){
        setTimeout(function(){
        
          if( self.key ){
            var t,
                mms,
                step = self.step;
            
            ++self.t;
            
            //求秒和秒表
            t = self.t;
            mms = step * t;

            var s  = ~~( mms/1000 );
            var ms = ~~( (mms - s * 1000)/100 );
            
            self.set(s, ms);
          }
          
          fn();
          
        }, self.step);
      }
      
      fn();
    },
    
    pause : function(){
      this.key = false;
    },
    
    goon : function(){
      this.key = true;
    },
    
    get : function(){
      return {
        sec : +domElem.time_sec.innerHTML,
        msec: +domElem.time_msec.innerHTML
      }
    },
    
    set : function(sec, msec){
      domElem.time_sec.innerHTML = sec;
      domElem.time_msec.innerHTML = msec;
    },
    
    reset : function(){
      this.t = 0;
      this.set(0, 0);
    }
    
  },
  
  Score : {
    s : 0,
    
    increase : function(n){
      n = n || ++this.s;
      
      this.set(n);
    },
    
    reduce : function(n){
      n = n || --this.s;
      
      this.set(n);
    },
    
    get : function(){
      return +domElem.score.innerHTML;
    },
    
    set : function(n){
      domElem.score.innerHTML = n;
    },
    
    reset : function(){
      this.s = 0;
      this.set(0);
    }
  },
  
  /**
    @num 生成num个棍子
  */
  createSticksData : function(num){
    var r = [];
  
    _.times(num, function(){
      r.push( new Stick() );
    });
    
    return r;
  },
  
  // 初始化棍子的 compare 数据
  initSticksCompare : function(){
    var r = [];
  
    _.each(StickOption.store, function(stick, i){
      r.push(stick);
      
      if (i !== 0) {
        for (var j = 0, len = r.length - 1; j < len; j++) {
          //如果相交
          if ( compareStick(r[j], stick) ) {
            r[j].compare.push( stick.id );
          }
        }
      }
    });
  },
  
  /**
    更新每个棍子的 compare 属性
    并返回当前最上面有哪些棍子的数组
    
    @removedStick 被移除的那个棍子(非必须)
  */
  updateSticksCompare : function(removedStick){
    
    var aim_id = -1;
    var ret = [];
    
    if( removedStick ){
      aim_id = removedStick.id;
    }
    
    //移除其他棍子里面的含有 aim_id 的值
    _.each(StickOption.store, function(stick){
      var index = stick.compare.indexOf(aim_id);
      
      if( index > -1 ){
        stick.compare.splice(index, 1);
      }
      
      if( stick.compare.length === 0 ){
        ret.push(stick);
      }
    });
    
    return ret;
    
  },
  
  drawSticks : function(){
    _.each(StickOption.store, function(stick){
      stick.draw();
    });
  },
  
  /**
    移除某个棍子
  */
  removeStick : function(stick){
    var id = stick.id;
  
    _.find(StickOption.store, function(stick, i){
      
      if( stick.id === id ){
        StickOption.store.splice(i, 1);
        
        return true;
      }
      
    });
    
    StickOption.up = Game.updateSticksCompare(stick);
  },
  
  /**
    判断circle和stick是否碰撞的细节
    如果碰到返回true，否则返回false
    
    @clicle 实例
    @stick  实例
  */
  checkCircleDetail : function(clicle, stick){
    
    var X = clicle.x, Y = clicle.y;

    var line = stick.line,
        x1 = line.x1, y1 = line.y1,
        x2 = line.x2, y2 = line.y2;
        
    
    var x, y; // 圆点到直线的垂直线的相交的那个点
    var L;    // 圆点到直线的垂直线的距离
    
    //首先把直线转化成Ax+By+C=0;求出A,B，C的值，这样方便利用公式
    var A = y2 - y1,
        B = x1 - x2,
        C = y1*x2 - x1*y2;
    
    L = getFloat( abs(A*X+B*Y+C)/sqrt(A*A+B*B) );
    //x = getFloat( (B/A*X-Y-C/B)/(B/A+A/B) );
    
    return L < OtherOption.MAXRANGE;
  },
  
  /**
    判断tabCircle和stick是否碰撞
  */
  checkCircle : function(circle, successCallback, failCallback){
    var k = false;
    
    _.find(StickOption.up, function(stick){
      
      // 点中了！
      if( Game.checkCircleDetail(circle, stick) ){
        
        Game.removeStick(stick);
        
        successCallback && successCallback();
        
        k = true;
        
        return true;
      }
      
    });
    
    if( !k ){
      failCallback && failCallback();
    }
  },
  
  bindUserTouch : _.once(function(){

    canvas.addEventListener(touchClick, function(e){
    
      if( !OtherOption.canPlayKey ) return;

      var event_x = isMobile ? e.targetTouches[0].pageX : e.pageX;
      var event_y = isMobile ? e.targetTouches[0].pageY : e.pageY;
      
      var canvas_left = canvas.offsetLeft;
      var canvas_top = 0;
      
      var circle_x = event_x - canvas_left;
      var circle_y = event_y - canvas_top;

      clearCanvas();
      
      var circle = new TabCircle(circle_x, circle_y);
      
      //找到点中的那个最上面的棍子，并移除它
      Game.checkCircle(circle, function(){
        Game.Score.increase();
      }, function(){
        Game.Score.reduce();
      });

      Game.drawSticks();
      
      circle.draw();
      
      if( Game.isSuccess() ){
        Game.success();
        
        clearCanvas();
        
        OtherOption.canPlayKey = false;
      }
      
    }, false);
    
  })
}



Game.start();

