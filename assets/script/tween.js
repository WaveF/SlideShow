/*---------------------------------------

	将此脚本组件添加到页面的元素
	节点上，然后设置动画相关属性
	
---------------------------------------*/

let easeConst = require("easeConst")

//----------------------------------------

let btnActionList = cc.Enum({
	goPrevPage: 0,
	goNextPage: 1,
	openURL:	2,
	popup:	  3
});

let btnActionMode = [
	'goPrevPage',
	'goNextPage',
	'openURL',
	'popup'
];

//----------------------------------------


cc.Class({
	extends: cc.Component,

	properties: {
		
		relativeX: {
		    default: 0,
		    tooltip: '根据当前x轴坐标进行初始化(相对定位)'
		},
		
		relativeY: {
		    default: 0,
		    tooltip: '根据当前y轴坐标进行初始化(相对定位)'
		},
		
		alpha:  {
			default: 255,
			type: cc.Integer,
			displayName: 'alpha (0-255)',
			tooltip: '透明度，范围从0至255'
		},
		
		angle: {
			default: 0,
			tooltip: '旋转角度'
		},
		
		xScale: {
			default: 1,
			tooltip: '水平缩放'
		},
		
		yScale: {
			default: 1,
			tooltip: '垂直缩放'
		},
		
		delay:  {
			default: 0,
			tooltip: '动画先暂停一段时间后再播放'
		},
		
		duration: {
			default: 1,
			tooltip: '动画持续时间'
		},
		
		animEase: {
			default: easeConst.animEase.normal,
			type: easeConst.animEase,
			tooltip: '动画缓动曲线'
		},
		
		btnEnable: {
			default: false,
			tooltip: '启用按钮'
		},
		
		btnSound: {
			default: null,
			url: cc.AudioClip,
			tooltip: '绑定按钮声音文件'
		},
		
		btnAction: {
			default: btnActionList.openURL,
			type: btnActionList,
			tooltip: '按钮动作'
		},
		
		btnParam1: {
			default: 'http://miniCG.com',
			displayName: 'Action Parameter 1',
			tooltip: '按钮动作参数1'
		},
		
		btnParam2: {
			default: null,
			type: cc.Prefab,
			displayName: 'Action Parameter 2',
			tooltip: '按钮动作参数2'
		},
		
	},

	
	onLoad: function () {
		
		let self = this;
		
		// 记录对象原始状态（终点）
		this.toX = this.node.x;
		this.toY = this.node.y;
		this.toScaleX = this.node.scaleX;
		this.toScaleY = this.node.scaleY;
		this.toAlpha  = this.node.opacity;
		this.toAngle  = this.node.rotation;
		
		
		// 根据相对坐标设定对象的初始位置
		this.node.x = this.node.x + this.relativeX;
		this.node.y = this.node.y + this.relativeY;
		
		
		// 透明度
		this.node.opacity = this.alpha;
		
		// 旋转角度
		this.node.rotation = this.angle;
		
		// 横向缩放
		this.node.scaleX = this.xScale;
		
		// 纵向缩放
		this.node.scaleY = this.yScale;
		
		
		// 记录对象起始状态（起点）
		this.fromX = this.node.x;
		this.fromY = this.node.y;
		this.fromAlpha = this.node.opacity;
		this.fromAngle = this.node.rotation;
		this.fromScaleX = this.node.scaleX;
		this.fromScaleY = this.node.scaleY;
		
		
		// 计算角度差值
		if(this.fromAngle > this.toAngle){
		    this.deltaAngle = this.toAngle - this.fromAngle;
		}else if(this.fromAngle < this.toAngle){
		    this.deltaAngle = this.fromAngle - this.toAngle;
		}
		
		// 初始化动画设定
		this.initAnim();
		
	},
	
	
	initAnim: function () {
	   
		let self = this;
		
		// 设置正序动画
		this.spawn = cc.spawn(
			cc.moveTo(this.duration,  cc.p(this.toX, this.toY)),
			cc.fadeTo(this.duration,  this.toAlpha),
			cc.scaleTo(this.duration, this.toScaleX, this.toScaleY),
			cc.rotateBy(this.duration,this.deltaAngle)
		);
		
		// 设置倒序动画
		this.revSpawn = cc.spawn(
			cc.moveTo(this.duration,  cc.p(this.fromX, this.fromY)),
			cc.fadeTo(this.duration,  this.fromAlpha),
			cc.scaleTo(this.duration, this.fromScaleX, this.fromScaleY),
			cc.rotateBy(this.duration,-this.deltaAngle)
		);
		
		// 设置缓冲曲线
		if (this.animEase != easeConst.animEase.normal) {
			this.easeMode = easeConst.easeMap[this.animEase];
			
			this.spawn	= this.spawn.easing(this.easeMode);
			this.revSpawn = this.revSpawn.easing(this.easeMode);
		}
		
		// 动画回调函数
		this.animCallback	= cc.callFunc(function(){ /**/ }, this);
		this.animRevCallback = cc.callFunc(function(){ /**/ }, this);
		
	},
	
	start: function () {
		
		// 按钮启用设定
		if(this.btnEnable){
			this.node.on(cc.Node.EventType.TOUCH_END, this.onBtnTouch, this);
		}
		
	},
	
	onBtnTouch: function (touches) {
		if(touches.target != this.node){ return false; }
		
		// 调用声音引擎播放声音
		if(this.btnSound){
			cc.audioEngine.playEffect(this.btnSound, false);
		}
		
		// 根据按钮动作设定执行相关动作
		switch (this.btnAction) {
				
			case 0:
				if(this.PAGE.STAGE.pageDirection===0){
					this.PAGE.STAGE.swipeToPage('right');
				}else{
					this.PAGE.STAGE.swipeToPage('down');
				}
				break;
				
			case 1:
				if(this.PAGE.STAGE.pageDirection===0){
					this.PAGE.STAGE.swipeToPage('left');
				}else{
					this.PAGE.STAGE.swipeToPage('up');
				}
				break;
			
			case 2:
				cc.sys.openURL(this.btnParam1);
				break;
				
			case 3:
				let tipsPopup = new cc.instantiate(this.btnParam2);
				tipsPopup.zIndex = 1;
				tipsPopup.active = true;
				tipsPopup.scaleX = 0;
				tipsPopup.scaleY = 0;
				
				// 避免重复弹出多次，先检测是否已存在同一弹框
				if(!this.PAGE.STAGE.tipsLayer.getChildByName(tipsPopup.name)){
				    this.PAGE.STAGE.tipsLayer.addChild(tipsPopup);
				    tipsPopup.runAction( cc.scaleTo(1.0, 1).easing(cc.easeElasticOut()) );
				}
				break;
		}
		
	},
	
	
	playAnim: function () {
		let seq;
		
		if(this.delay < 0){ return false }
		if(this.delay > 0){ seq = cc.sequence( cc.delayTime(this.delay), this.spawn, this.animCallback) }
		if(this.delay === 0){ seq = cc.sequence( this.spawn, this.animCallback) }
		
		if(this.PAGE.STAGE.lastPageID > 0){
			this.node.stopAllActions();
		}
		
		this.node.runAction(seq);
	},
	
	reverseAnim: function () {
		let seq = cc.sequence(this.revSpawn, this.animRevCallback);
		this.node.runAction(seq);
	},
	
	resetToBegin: function() {
		this.node.stopAllActions();
		this.node.x         =  this.fromX;
		this.node.y         =  this.fromY;
		this.node.opacity   =  this.fromAlpha;
		this.node.rotation  =  this.fromAngle;
		this.node.scaleX    =  this.fromScaleX;
		this.node.scaleY    =  this.fromScaleY;
	},
	
    
	testme: function (){
		console.log('this is tween.js');
	},

	/*
	update: function (dt) {
	
	},*/
	
});
