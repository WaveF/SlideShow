cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_END, this.onBtnTouch, this);
    },
    
    onBtnTouch: function (touches) {
		if(touches.target != this.node){ return false; }
		
		let closeBtn = this;
		let closeWin = this.node.parent;
		let callback = cc.callFunc(function(){
		    closeWin.parent.removeChild(closeWin);
		}, this);
		
		closeWin.runAction( cc.sequence(cc.scaleTo(0.6, 0).easing(cc.easeBackIn()), callback) );
    },


    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
