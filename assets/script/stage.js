/*---------------------------------------

	将此脚本组件添加到页面的根元素上，
	然后将页面prefab拖动到本组件属性栏
	
---------------------------------------*/

let directionList = cc.Enum({
	horizontal: 0,
	verticle: 1
});

let directionMode = [
	'horizontal',
	'verticle'
];

//----------------------------------------

cc.Class({
	extends: cc.Component,

	properties: {
		
		pageDirection: {
			default: directionList.horizontal,
			type: directionList,
			tooltip: '页面排列方向'
		},
		
		pages: {
			default: [],
			type: [cc.Prefab],
			tooltip: '将页面Prefab绑定到此栏目'
		},
		
		swipeThreshole: {
			default: 50,
			tooltip: '滑动灵敏度\n数值越大越不敏感，不能为负值'
		},
		
		duration: {
			default: 1,
			tooltip: '转场动画时间'
		},
		
		fastSwipe: {
			default: false,
			tooltip: '快速翻页\n不等待转场动画结束，极端情况下可能会出错'
		},
		
		orientationTips:{
			default: null,
			type: cc.Prefab,
			tooltip: '设备处于非设计方向时弹出此提示'
		},
		
		bgmAutoPlay: {
			default: true,
			tooltip: '背景音乐自动播放'
		},
		
		bgMusic: {
			default: null,
			url: cc.AudioClip,
			tooltip: '绑定背景音乐声音文件'
		},
		
		bgmButton: {
			default: null,
			type: cc.Prefab,
			tooltip: '绑定背景音乐按钮'
		},
		
		bgmButtonPosition: {
			default: '80, 90',
			displayName: 'Bgm Button Position(%)',
			tooltip: '背景音乐按钮位置\n以逗号分隔 x 与 y 轴百分比坐标(基于屏幕中心及半屏尺寸)\n举例：左上角可定义为"-80,90"'
		}
		
	},


	// 初始化
	onLoad: function () {
		
		// cc._initDebugSetting(cc.DebugMode.INFO);
		
		let self = this;
		
		this.oldX = 0;
		this.oldY = 0;
		this.deltaX = 0;
		this.deltaY = 0;
		this.isScrolling = false;
		this.lastPageID = 0;
		this.currentPageID = 1;
		this.totalPages = this.pages.length;
		this.pageInstances = [];
		
		// 记录背景音乐初始化播放状态
		this.bgmPlaying = this.bgmAutoPlay;
		
		// 添加页面容器
		this.container = new cc.Node();
		this.container.name = 'container';
		this.node.addChild(this.container);
		
		// 生成提示图层
		this.tipsLayer = new cc.Node();
		this.tipsLayer.name = 'tipsLayer';
		this.node.addChild(this.tipsLayer);
		
		// 生成置顶图层
		this.topLayer = new cc.Node();
		this.topLayer.name = 'topLayer';
		this.node.addChild(this.topLayer);
		
		// 添加侦听器
		this.node.on(cc.Node.EventType.TOUCH_START,  this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE,   this.onTouchMove,  this);
		this.node.on(cc.Node.EventType.TOUCH_END,    this.onTouchEnd,   this);
		this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd,   this);
		
		// 解决声音暂停后切换标签页又自动播放的问题
        cc.game.resume = function () {
            if (!this._paused) return;
            this._paused = false;
            
            if(self.bgmPlaying){
                cc.audioEngine && cc.audioEngine._resumePlaying();
            }else{
                cc.audioEngine && cc.audioEngine._pausePlaying();
            }
            
            this._runMainLoop();
        };
        
	},
	
	start: function () {
		
		let self = this;
		
		// 动态添加页面
		for(let i=0; i<this.totalPages; i++){
			
			let newPage = cc.instantiate(this.pages[i]);
			
			this.container.addChild(newPage);
			
			// 数组暴力记录每一页的实例
			this.pageInstances.push(newPage);
			
			// 将舞台实例传给每一页（每页又会传递到每个动画子对象）
			newPage.getComponent('page').init(this);
			
			// 获取首页面宽高
        	if(!this.pageWidth) { this.pageWidth  = this.container.children[0].width; }
        	if(!this.pageHeight){ this.pageHeight = this.container.children[0].height; }
			
			// 水平排列
			if(this.pageDirection === 0){
				newPage.setPosition(cc.p(this.pageWidth * i, 0));
			}
			
			// 垂直排列
			if(this.pageDirection === 1){
				newPage.setPosition(cc.p(0, -this.pageHeight * i));
			}
			
		}
		
    	// 通过判断页面宽高来记录屏幕初始设计方向
    	if(this.pageWidth > this.pageHeight){
    		this.orientation = 'landscape';
    	}else if(this.pageWidth < this.pageHeight){
    		this.orientation = 'portrait';
    	}
		
		// 设置容器尺寸
		this.container.setContentSize(cc.size(this.pageWidth, this.pageHeight));
		
		// 自动播放首页动画
		this.pageInstances[0].getComponent('page').startPageAnim();
		
		
		// 播放背景音乐组件
		if(this.bgMusic && this.bgmButton){
			
			// 实例化背景音乐按钮并添加到置顶图层中
			this.bgmBtn = cc.instantiate(this.bgmButton);
			this.bgmBtn.parent = this.topLayer;
			this.bgmBtn.setContentSize(cc.size(this.bgmBtn.children[0].width, this.bgmBtn.children[0].height));
			
			// 设置背景音乐按钮坐标
			let bgmBtnPX = parseFloat(this.bgmButtonPosition.split(',')[0]);
			let bgmBtnPY = parseFloat(this.bgmButtonPosition.split(',')[1]);
			this.bgmBtn.setPosition(cc.p(this.pageWidth/2*bgmBtnPX/100, this.pageHeight/2*bgmBtnPY/100));
			
			// 初始化背景音乐播放状态
			this.bgmPlayed = false;
			this.playBGM(this.bgmPlaying);
			
			// 添加背景音乐按钮点击侦听
			this.bgmBtn.on(cc.Node.EventType.TOUCH_START, this.bgmBtnHandler, this);
		}
		
		// 旋屏提示
		if(this.orientationTips){
			this.rotateTips = cc.instantiate(this.orientationTips);
			this.rotateTips.active = false;
			this.rotateTips.opacity = 0;
			this.rotateTips.zIndex = 999;
			this.rotateTips.parent = this.tipsLayer;
			
			self.detectOrientation();
            cc.view.setResizeCallback(function(){
                self.detectOrientation();
            });
		}
		
	},
	
	detectOrientation: function () {
		let w = cc.view.getVisibleSize().width;
		let h = cc.view.getVisibleSize().height;
		
		let fadeDuration = 0.4;
		let fadeFunc = cc.callFunc(function(){
		    this.rotateTips.active = false;
		}, this);
		
		if(w>h && this.orientation=='portrait'){
			this.rotateTips.active = true;
		    this.rotateTips.runAction(cc.fadeIn(fadeDuration));
		}else if(w<h && this.orientation=='landscape'){
			this.rotateTips.active = true;
			this.rotateTips.runAction( cc.fadeIn(fadeDuration) );
		}else{
			this.rotateTips.runAction( cc.sequence(cc.fadeOut(fadeDuration), fadeFunc) );
		}
	},
	
	bgmBtnHandler: function (touches) {
		if(touches.target != this.bgmBtn){ return false; }
		
		this.bgmPlaying = !this.bgmPlaying;
		this.playBGM(this.bgmPlaying);
	},
	
	playBGM: function (play) {
		
		if (play) {
			if(!this.bgmPlayed){
				cc.audioEngine.playMusic(this.bgMusic, true);
				this.bgmPlayed = true;
			}
			
			//cc.audioEngine.resumeMusic();
			cc.audioEngine._resumePlaying();
			
			if(this.bgmBtn.children.length > 1){
				this.bgmBtn.children[0].active = true;
				this.bgmBtn.children[1].active = false;
			}else if(this.bgmBtn.children.length == 1){
				this.bgmBtn.children[0].opacity = 255;
			}
		} else {
			//cc.audioEngine.pauseMusic();
			cc.audioEngine._pausePlaying();
			
			if(this.bgmBtn.children.length > 1){
				this.bgmBtn.children[0].active = false;
				this.bgmBtn.children[1].active = true;
			}else if(this.bgmBtn.children.length == 1){
				this.bgmBtn.children[0].opacity = 120;
			}
		}
		
	},
	
	onTouchStart: function (touches) {
	    // 防止冒泡
	    if(touches.target != this.node){ return false; }
	    
		this.oldX = touches.currentTouch._point.x;
		this.oldY = touches.currentTouch._point.y;
	},
	
	
	onTouchMove: function (touches) {
		this.deltaX = touches.currentTouch._point.x - this.oldX;
		this.deltaY = touches.currentTouch._point.y - this.oldY;
		return false;
	},
	
	
	onTouchEnd: function (touches) {
	    // 防止冒泡
	    if(touches.target != this.node){ return false; }
	    
		if(this.fastSwipe){
			this.swipeAction();
		}else{
			if(!this.isScrolling){ this.swipeAction(); }
		}
	},
	
	swipeToPage: function (direct){
		
		let action, seq, actionCallback;
		
		// 记录上一页ID
		this.lastPageID = this.currentPageID;
		
		// 动画结束回调
		actionCallback = cc.callFunc(function(){
			this.currentPage = this.pageInstances[this.currentPageID-1];
			this.currentPage.getComponent('page').startPageAnim();
			
			if(this.currentPageID-2 >= 0){
		    	this.currentPage = this.pageInstances[this.currentPageID-2];
		    	this.currentPage.getComponent('page').resetPageAnim();
			}
			
			if(this.currentPageID < this.pageInstances.length){
		    	this.currentPage = this.pageInstances[this.currentPageID];
		    	this.currentPage.getComponent('page').resetPageAnim();
			}
			
			this.isScrolling = false;
		}, this);
		
		// 页面转场动画
		let pageTransMode = this.pageInstances[this.currentPageID-1].getComponent('page').transMode;
		
		switch (direct) {
			
			// 往左滑动---------------------------------
			case 'left':
				if(this.currentPageID<this.totalPages){
					
					this.isScrolling = true;
					
					this.lastPage = this.pageInstances[this.lastPageID-1];
					this.lastPage.getComponent('page').revPageAnim();
					
					action = cc.moveBy( this.duration, cc.p(-this.pageWidth, 0)).easing(pageTransMode);
					seq =  cc.sequence( action.clone(), actionCallback );
					
					this.container.runAction(seq.clone());
					this.currentPageID++;
				}
				break;
				
			// 往右滑动---------------------------------
			case 'right':
				if(this.currentPageID>1){
					
					this.isScrolling = true;
					
					this.lastPage = this.pageInstances[this.lastPageID-1];
					this.lastPage.getComponent('page').revPageAnim();
					
					action = cc.moveBy(this.duration, cc.p(this.pageWidth, 0)).easing(pageTransMode);
					seq = cc.sequence( action.clone(), actionCallback );
					
					this.container.runAction(seq.clone());
					this.currentPageID--;
				}
				break;
				
			// 往上滑动---------------------------------
			case 'up':
				if(this.currentPageID<this.totalPages){
					
					this.isScrolling = true;
					
					this.lastPage = this.pageInstances[this.lastPageID-1];
					this.lastPage.getComponent('page').revPageAnim();
					
					action = cc.moveBy(this.duration, cc.p(0, this.pageHeight)).easing(pageTransMode);
					seq = cc.sequence( action.clone(), actionCallback );
					
					this.container.runAction(seq.clone());
					this.currentPageID++;
				}
				break;
			
			// 往下滑动---------------------------------
			case 'down':
				if(this.currentPageID>1){
					
					this.isScrolling = true;
					
					this.lastPage = this.pageInstances[this.lastPageID-1];
					this.lastPage.getComponent('page').revPageAnim();
					
					action = cc.moveBy(this.duration, cc.p(0, -this.pageHeight)).easing(pageTransMode);
					seq = cc.sequence( action.clone(), actionCallback );
					
					this.container.runAction(seq.clone());
					this.currentPageID--;
				}
				break;
				
		}
	},
	
	swipeAction: function () {
		
		// 如果页面是水平排列
		if(this.pageDirection === 0){
			
			//向左滑动
			if(this.deltaX<-this.swipeThreshole){
				this.swipeToPage('left');
			}
			
			//向右滑动
			if(this.deltaX>this.swipeThreshole){
				this.swipeToPage('right');
			}
			
		}
		
		
		// 如果页面是垂直排列
		if(this.pageDirection === 1){
			
			//向上滑动
			if(this.deltaY>this.swipeThreshole){
				this.swipeToPage('up');
			}
			
			//向下滑动
			if(this.deltaY<-this.swipeThreshole){
				this.swipeToPage('down');
			}
			
		}
		
	},
	
	
	testme: function () {
		console.log('this is stage.js');
	},
	

	/*update: function (dt) {
		
	},*/
	
	
	
});
