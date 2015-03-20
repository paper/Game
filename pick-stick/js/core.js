
var Game = {
  
  init : function(){
    
    StickOption.store = Game.createSticksData(StickOption.number);
  
    console.log( StickOption.store );
    
    Game.initSticksCompare();
    
    StickOption.up = Game.updateSticksCompare();
    
    Game.bindUserTouch();
    
    Game.drawSticks();
  },
  
  start : function(){},
  
  success : function(){},
  
  reset : function(){},
  
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
  checkCircle : function(circle){
    console.log(circle);
    console.log(StickOption.up);
    
    _.find(StickOption.up, function(stick){
      
      // 点中了！
      if( Game.checkCircleDetail(circle, stick) ){
        
        Game.removeStick(stick);
        
        return true;
      }
      
    });
  },
  
  bindUserTouch : function(){
  
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
      Game.checkCircle(circle);

      Game.drawSticks();
      
      circle.draw();
      
    }, false);
    
  }
}

Game.init();


