/*---------------------------------------

	将此脚本组件添加到prefab页面的容器
	
	- 手动设置页面尺寸
	- 添加 Widget 组件
	- 拖拽节点元素到组件属性栏，
	
---------------------------------------*/

let easeConst = require("easeConst")

//----------------------------------------

cc.Class({
	extends: cc.Component,

	properties: {
		
		animEase: {
			default: easeConst.animEase.normal,
			type: easeConst.animEase,
			tooltip: '转场动画\n从当前页跳到下一页时的动画，\n无论是往前跳还是往后跳'
		},
		
		clips: {
			default: [],
			type: [cc.Node],
			tooltip: '绑定动画元件'
		},
		
		
		/*bgColor: cc.Color.WHITE*/
		
	},

	onLoad: function () {
		
		for(let i=0; i<this.clips.length; i++){
			this.clips[i].getComponent('tween').PAGE = this;
		}
		
		// 设置缓冲曲线
		if (this.animEase != easeConst.animEase.normal) {
			this.transMode = easeConst.easeMap[this.animEase];
		}else{
			this.transMode = cc.easeCubicActionOut();
		}
	},
	
	init: function (stg) {
		this.STAGE = stg;
	},
	
	start: function () {
		
		this.node.addComponent(cc.Mask);
		/*this.node.addComponent(cc.Widget);
		
		let widget = this.getComponent(cc.Widget);
		
		if(this.STAGE.pageDirection===0){
			widget.isAbsoluteTop = true;
			widget.isAbsoluteBottom = true;
			widget.isAbsoluteLeft = false;
			widget.isAbsoluteRight = false;
			
		}else{
			widget.isAbsoluteTop = false;
			widget.isAbsoluteBottom = false;
			widget.isAbsoluteLeft = true;
			widget.isAbsoluteRight = true;
		}
		
		widget.top = 0;
		widget.bottom = 0;
		widget.left = 0;
		widget.right = 0;*/
		
	},
	
	startPageAnim: function () {
		for(let i=0; i<this.clips.length; i++){
			this.clips[i].getComponent('tween').playAnim();
		}
	},
	
	revPageAnim: function () {
		for(let i=0; i<this.clips.length; i++){
			this.clips[i].getComponent('tween').reverseAnim();
		}
	},
	
	resetPageAnim: function () {
		for(let i=0; i<this.clips.length; i++){
			this.clips[i].getComponent('tween').resetToBegin();
		}
	},
	
	testme: function () {
		console.log('this is page.js');
	},
	

	// update: function (dt) {

	// },
});
