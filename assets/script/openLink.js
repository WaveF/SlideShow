cc.Class({
    extends: cc.Component,

    properties: {
        link: 'http://www.minicg.com'
    },

    // use this for initialization
    onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_END, this.onBtnTouch, this);
    },
    
    onBtnTouch: function (touches) {
		if(touches.target != this.node){ return false; }
		cc.sys.openURL(this.link);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
