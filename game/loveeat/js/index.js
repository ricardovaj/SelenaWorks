var sw=20,//方块宽
    sh=20,//方块高
    tr=30,//行
    td=30;//列
    var snake=null,//蛇的实例
        food=null,//食物的实例
        game=null;//游戏实例
//创建方块
function Square(x,y,classname){
    this.x=x*sw;
    this.y=y*sh;
    this.class=classname;
    this.viewcontent=document.createElement('div');//储存一个方块元素DOM
    this.viewcontent.className=this.class;
    this.parent=document.getElementById('snakeWrap');//方块的父级
};
Square.prototype.create=function(){//创建方块DOM
    this.viewcontent.style.position='absolute';
    this.viewcontent.style.width=sw+'px';
    this.viewcontent.style.height=sh+'px';
    this.viewcontent.style.left=this.x+'px';
    this.viewcontent.style.top=this.y+'px';
    this.parent.appendChild(this.viewcontent);
};
Square.prototype.remove=function(){
    this.parent.removeChild(this.viewcontent);
};
//创建贪吃蛇
function Snake(){
    this.head=null;//存一下蛇头的信息
    this.tail=null;//蛇尾
    this.pose=[];//蛇每个方块位置
    this.directionNum={//蛇的方向
        left:{
            x:-1,
            y:0,
            rotate:180
        },
        right:{
            x:1,
            y:0,
            rotate:0
        },
        up:{
            x:0,
            y:-1,
            rotate:-90
        },
        down:{
            x:0,
            y:1,
            rotate:90
        }
    }
};
Snake.prototype.init=function(){
    //创建蛇头
    var snakeHead=new Square(2,0,'snakeHead');
    snakeHead.create();
    this.head=snakeHead;//存储蛇头信息
    this.pose.push([2,0]);//蛇头位置存储
    //创建初始蛇身
    var snakeBody1=new Square(1,0,'snakeBody');
    snakeBody1.create();
    this.pose.push([1,0]);//蛇身1存储

    var snakeBody2=new Square(0,0,'snakeBody');
    snakeBody2.create();
    this.tail=snakeBody2;//把蛇尾存储
    this.pose.push([0,0]);//蛇身2存储

    //蛇形成链表关系
    snakeHead.last=null;
    snakeHead.next=snakeBody1;

    snakeBody1.last=snakeHead;
    snakeBody1.next=snakeBody2;

    snakeBody2.last=snakeBody1;
    snakeBody2.next=null;

    //给蛇添加默认方向
    this.direction=this.directionNum.right;//初始默认向右走
};
//获取蛇头下一个位置对应元素，反应
Snake.prototype.getNextpose=function(){
    var nextPose=[//蛇头下一步坐标
        this.head.x/sw+this.direction.x,
        this.head.y/sh+this.direction.y
    ];
    //若是自己,gameover
    var selfCollied=false;//标记是否撞到自己
    this.pose.forEach(function(value){
        if(value[0]==nextPose[0] && value[1]==nextPose[1]){//引用类型不能直接比较
            //如果坐标重合，装撞自己
            selfCollied=true
        };
    });
    if(selfCollied){
        console.log('玩NM,吃到自己了');
        this.startegies.die.call(this);
        return;
    };
    //下一步是边界,gameover
    if(nextPose[0]<0 || nextPose[1]<0 || nextPose[0]>td-1 || nextPose[1]>tr-1){
        console.log('不撞南墙不回头');
        this.startegies.die.call(this);
        return;
    };
    //实物,吃
    if(food && food.pose[0]==nextPose[0] && food.pose[1]==nextPose[1]){
        //蛇头下步为食物
        console.log('总算吃到东西了!');
        this.startegies.eat.call(this);
        return;
    }
    //空,走
    this.startegies.move.call(this);//把调用move的对象(startegies)改成目前函数调用者(Snake)
};
//处理碰撞后事件
Snake.prototype.startegies={
    move:function(format){//参数决定是否删除蛇尾,没有传则表示没有吃
        //创建一个新身体（放在原蛇头位置）
        var newBody=new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表
        newBody.next=this.head.next;
        newBody.next.last=newBody;
        newBody.last=null;
        //删除原蛇头
        this.head.remove();
        newBody.create();
        //创建新蛇头(下一步坐标)
        var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead');
        //更新链表
        newHead.next=newBody;
        newHead.last=null;
        newBody.last=newHead;
        newHead.viewcontent.style.transform='rotate('+this.direction.rotate+'deg)';
        newHead.create();
        //更新蛇的身体坐标
        this.pose.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
        this.head=newHead
       
        if(!format){//没有吃format为false
            this.tail.remove();//旧蛇尾
            this.tail=this.tail.last;//新蛇尾
            this.pose.pop();
        }
        console.log(this.pose);
    },
    eat:function(){
        this.startegies.move.call(this,true);
        createFood();
        game.score+=10;
    },
    die:function(){
        game.over();
    }
}
snake=new Snake();

//创建食物
function createFood(){
    //食物的随机坐标
    var x=null;
    var y=null;
    var include=true;
    while(include){
        x=Math.round(Math.random()*(td-1));
        y=Math.round(Math.random()*(tr-1));
        snake.pose.forEach(function(value){
            if(x!=value[0] && y!=value[1]){
                //坐标不是蛇身
                include=false;
            }
        });
    };
    //生成食物
    food=new Square(x,y,'food');
    food.pose=[x,y];//判断是否吃到食物
    var foodDom=document.querySelector('.food');
    if(foodDom){
        foodDom.remove();
    };
    food.create();
};
//创建游戏逻辑
function Game(){
    this.timer=null;
    this.score=0;
};
Game.prototype.init=function(){
    snake.init();
    createFood();

    document.onkeydown=function(e){
        if(e.which==37 && snake.direction!=snake.directionNum.right){//蛇往右时不能左走
            snake.direction=snake.directionNum.left;
        }else if(e.which==38 && snake.direction!=snake.directionNum.down){
            snake.direction=snake.directionNum.up;
        }else if(e.which==39 && snake.direction!=snake.directionNum.right){
            snake.direction=snake.directionNum.right;
        }else if(e.which==40 && snake.direction!=snake.directionNum.up){
            snake.direction=snake.directionNum.down;
        }
    }
    this.start();
};
Game.prototype.pause=function(){
    clearInterval(this.timer);
};
Game.prototype.over=function(){
    clearInterval(this.timer);
    alert('菜鸡,你的得分为：'+this.score);
    //游戏回到初始状态
    var snakeWrap=document.getElementById('snakeWrap');
    snakeWrap.innerHTML='';
    snake=new Snake();
    game=new Game();
    var startBtnWrap=document.querySelector('.startBtn');
    startBtnWrap.style.display='block';
};
Game.prototype.start=function(){//开始游戏
    this.timer=setInterval(function(){
        snake.getNextpose();
    },200);
}
//开启游戏
game=new Game();
var startBtn=document.querySelector('.startBtn button');
startBtn.onclick=function(){
    startBtn.parentNode.style.display='none';
    game.init();
}
//暂停游戏
var snakeWrap=document.getElementById('snakeWrap');
var pauseBtn=document.querySelector('.pauseBtn button');
snakeWrap.onclick=function(){
    game.pause();
    pauseBtn.parentNode.style.display='block';
}
pauseBtn.onclick=function(){
    game.start();
    pauseBtn.parentNode.style.display='none';
}