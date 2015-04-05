var Game = {
  
  status : 0,
  
  STATUS : {
    BEGIN : 0,
    
    INIT : 1,
    
    INITEND : 2,
    
    START : 3,
    
    SUCCESS : 4,
    
    REST : 5
  },
  
  init : function(){
    
    Game.status = Game.STATUS.INIT;
    
    OtherOption.canPlayKey = true;
    
    StickOption.store = Game.createSticksData(StickOption.number);
  
    //console.log( StickOption.store );
    
    Game.initSticksCompare();
    
    StickOption.up = Game.updateSticksCompare();
    
    Game.bindUserTouch();
    
    Game.drawSticks();
    
    Game.status = Game.STATUS.INITEND;
  },
  
  start : function(){
    Game.reset();
    Game.init();
    
    Game.Time.start();
    
    Game.status = Game.STATUS.START;
  },
  
  isSuccess : function(){
    return Game.status === Game.STATUS.START && StickOption.store.length === 0;
  },
  
  success : function( callback ){
    Game.Time.pause();
    
    var time = Game.Time.get();
    var score = Game.Score.get();
    
    Game.status = Game.STATUS.SUCCESS;
    
    callback && callback(score, time.sec, time.msec);
  },
  
  reset : function( callback ){
    clearCanvas();
    StickOption.store.length = 0;
    StickOption.up.length = 0;
    
    Game.Score.reset();
    Game.Time.reset();
    
    Game.status = Game.STATUS.REST;
    
    callback && callback();
  },
  
  /**
    开始计时
  */
  Time : {
    step : 100,
    
    n : 0,
    key : true,
    status : 3,
    t : null,
    
    STATUS : {
      START : 1,
      PAUSE : 2,
      RESET : 3
    },
    
    start : function(){
      var self = this;
      
      self.reset();
      
      self.status = self.STATUS.START;
      
      self.t = setInterval(function(){
        if( self.key && self.status === self.STATUS.START ){
          ++self.n;
          
          //求秒和秒表
          var mms = self.step * self.n;
          var s  = ~~( mms/1000 );
          var ms = ~~( (mms - s * 1000)/100 );
          
          self.set(s, ms);
        }
      }, self.step);
    },
    
    pause : function(){
      this.key = false;
      this.status = this.STATUS.PAUSE;
    },
    
    goon : function(){
      this.key = true;
      this.status = this.STATUS.START;
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
      this.n = 0;
      this.key = true;
      clearInterval(this.t);
      
      this.set(0, 0);
      this.status = this.STATUS.RESET;
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
        
        pageAction.gameSuccess();
      }
      
    }, false);
    
  })
}


// 封面画画棍子
function drawCoverCanvas(){

  var coverCanvas = document.getElementById('coverCanvas');
  coverCanvas.width = windowWidth;
  coverCanvas.height = windowHeight;
  
  var coverCtx = coverCanvas.getContext('2d');
  //var sticks = [];
  
  _.each(_.range(100), function(){
    var left = _.random(-windowWidth, windowWidth),  
       top = _.random(0, windowHeight), 
       width = _.random(20, windowWidth),
       height = 10,
       deg = -45, 
       n = _.random(1, 8);

    var stick = new Stick(left, top, width, height, deg, n);
    stick.draw(coverCtx);
    //sticks.push(stick);
  });
  
}

drawCoverCanvas();


