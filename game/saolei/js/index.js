//构造函数
function Mine(tr,td,mineNum){
    this.tr=tr;
    this.td=td;
    this.mineNum=mineNum;//雷的数量
    this.squares=[];
    this.tds=[];//储存雷区单元格(二维数组)
    this.lastNum=mineNum;//剩余雷数
    this.allRight=true;//变量控制旗子是否正确
    this.parent=document.querySelector('.gameBox')
}
//创建99个随机数
Mine.prototype.randonNum=function(){
    var square=new Array(this.tr*this.td);
    for(i=0;i<square.length;i++){
        square[i]=i;
    };
    square.sort(function(){return 0.5-Math.random();});
    return square.slice(0,this.mineNum);
}
//初始化
Mine.prototype.init=function(){
    var rn=this.randonNum();//地雷位置信息
    var n=0;//找到格子索引
    for(i=0;i<this.tr;i++){
        this.squares[i]=[];
        for(j=0;j<this.td;j++){
            //找方块周围信息用坐标，区方块信息用行列表
            n++;
            if(rn.indexOf(n)!=-1){
                this.squares[i][j]={//利用列表保存坐标
                    type:'mine',
                    x:j,
                    y:i
                }
            }else{
                this.squares[i][j]={
                    type:'number',
                    x:j,
                    y:i,
                    value:0
                }
            };
        };
    };
    this.updateNum();
    this.createDom();
    this.parent.oncontextmenu=function(){
        return false;
    };
    this.mineDom=document.querySelector('.mineNum');
    this.mineDom.innerHTML=this.lastNum;
}
//创建雷区
Mine.prototype.createDom=function(){
    var This=this;
    var table=document.createElement('table');
    for(i=0;i<this.tr;i++){
        var domtr=document.createElement('tr');
        this.tds[i]=[];//保存每一行的单元
        for(j=0;j<this.td;j++){
            var domtd=document.createElement('td');
            domtd.pose=[i,j];//把格子对应的行与列存到格子身上，为了下面通过这个值去数组里取到对应的数据
            domtd.onmousedown=function(){
                This.play(event,this);//This指的实例对象，this指的点击的那个td
            };
            this.tds[i][j]=domtd;//保存方格
            // if(this.squares[i][j].type=='mine'){
            //     domtd.className='mine';
            // };
            // if(this.squares[i][j].type=='number'){
            //     domtd.innerHTML=this.squares[i][j].value;
            // };
            domtr.appendChild(domtd);
        }
        table.appendChild(domtr);
    }
    this.parent.innerHTML='';//防止选择模式重复创建
    this.parent.appendChild(table);
};
//寻找雷周围八个方格
Mine.prototype.getAround=function(square){
    var x=square.x;//此时x为列表的domtd
    var y=square.y;
    var result=[];//保存找到的方格
    for(var i=x-1;i<=x+1;i++){
		for(var j=y-1;j<=y+1;j++){
			if(
				i<0 ||	//格子超出了左边的范围
				j<0	||	//格子超出了上边的范围
				i>this.td-1 ||	//格子超出了右边的范围
				j>this.tr-1	||	//格子超出了下边的范围
				(i==x && j==y) ||	//当前循环到的格子是自己
				this.squares[j][i].type=='mine'	//周围的格子是个雷
			){
				continue;
			}
			result.push([j,i]);	//要以行与列的形式返回出去。因为到时候需要用它去取数组里的数据
		}
	}
	return result;
};
//更新雷周围方块数字
Mine.prototype.updateNum=function(){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='number'){
                continue;
            };
            var num=this.getAround(this.squares[i][j]);
            for(var k=0;k<num.length;k++){
                this.squares[num[k][0]][num[k][1]].value+=1;
            };
        };
    };
};
//开始游戏
Mine.prototype.play=function(ev,obj){
    var This=this;
    if(ev.which==1 && obj.className!='flag'){//点击左键且不能左键点击小旗子
        var curSquare=this.squares[obj.pose[0]][obj.pose[1]];//找到方块信息
        var numColor=['zero','one','two','three','four','five','six','seven','eigth'];
        if(curSquare.type=='number'){//点的是数字
            obj.innerHTML=curSquare.value;
            obj.className=numColor[curSquare.value];
            if(curSquare.value==0){//当前点击方块为0时
                obj.innerHTML='';//不显示0
                function getAllZero(square){
                    var around=This.getAround(square);//找到周围的格子非雷格子
                    for(var i=0;i<around.length;i++){
                        var x=around[i][0];//行
                        var y=around[i][1];//列
                        This.tds[x][y].className=numColor[This.squares[x][y].value];
                        if(This.squares[x][y].value==0){//周围方块为0时
                            if(!This.tds[x][y].check){
                                This.tds[x][y].check=true;//设置钥匙，防止无限循环
                                getAllZero(This.squares[x][y]);//递归周围的方格继续寻找
                            } 
                        }else{//显示找到非0数字
                            This.tds[x][y].innerHTML=This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(curSquare);
            }
        }else{//点的是雷
            this.gameOver(obj);
            alert('弱者不配赢！');
        }
    }
    if(ev.which==3){//点击右键
        if(obj.className && obj.className!='flag'){
            return;
        };
        obj.className=obj.className=='flag'?'':'flag';
        if(this.squares[obj.pose[0]][obj.pose[1]].type=='mine'){
            this.allRight=true;//红旗后是雷
        }else{
            this.allRight=false;
        };
        if(obj.className=='flag'){
            this.mineDom.innerHTML=--this.lastNum;
        }else{
            this.mineDom.innerHTML=++this.lastNum;
        };
        if(this.lastNum==0){//用户旗子插满
            if(this.allRight){
                alert('菜逼，恭喜你活下来了！');
            }else{
                this.gameOver();
                alert('弱者不配赢！');
            }
        }
    }
};
//游戏失败
Mine.prototype.gameOver=function(clicktd){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type=='mine'){
                this.tds[i][j].className='mine';
            }
            this.tds[i][j].onmousedown=null;
        }
    }
    if(clicktd){
        clicktd.style.backgroundColor='#f00';
    }
};
//选择游戏模式
var btns=document.querySelectorAll('.level button');
var mine=null;//实例
var ln=0;//当前选中状态
var arr=[[9,9,10],[16,16,64],[28,28,128]];
for(let i=0;i<btns.length-1;i++){
	btns[i].onclick=function(){
		btns[ln].className='';
		this.className='active';
		mine=new Mine(...arr[i]);
		mine.init();
		ln=i;
	}
}
btns[0].onclick();//默认简单模式
btns[3].onclick=function(){
	mine.init();
}