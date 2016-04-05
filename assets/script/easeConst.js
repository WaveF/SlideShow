/*---------------------------------------

	请勿编辑本脚本 !!
	除非你知道自己在做什么 ??
	感谢NightFarmer提供的代码~
	
---------------------------------------*/


let easeConst = {};

easeConst.easeMap = [
	// cc.easeIn(),
	// cc.easeOut(),
	// cc.easeInOut(),
	cc.easeExponentialIn(),
	cc.easeExponentialOut(),
	cc.easeExponentialInOut(),
	cc.easeSineIn(),
	cc.easeSineOut(),
	cc.easeSineInOut(),
	cc.easeElasticIn(),
	cc.easeElasticOut(),
	cc.easeElasticInOut(),
	cc.easeBounceIn(),
	cc.easeBounceOut(),
	cc.easeBounceInOut(),
	cc.easeBackIn(),
	cc.easeBackOut(),
	cc.easeBackInOut(),
	// cc.easeBezierAction(),
	cc.easeQuadraticActionIn(),
	cc.easeQuadraticActionOut(),
	cc.easeQuadraticActionInOut(),
	cc.easeQuarticActionIn(),
	cc.easeQuarticActionOut(),
	cc.easeQuarticActionInOut(),
	cc.easeQuinticActionIn(),
	cc.easeQuinticActionOut(),
	cc.easeQuinticActionInOut(),
	cc.easeCircleActionIn(),
	cc.easeCircleActionOut(),
	cc.easeCircleActionInOut(),
	cc.easeCubicActionIn(),
	cc.easeCubicActionOut(),
	cc.easeCubicActionInOut()

];

easeConst.animEase = cc.Enum({
	// easeIn:-1,
	// easeOut:-1,
	// easeInOut:-1,
	easeExponentialIn: -1,
	easeExponentialOut: -1,
	easeExponentialInOut: -1,
	easeSineIn: -1,
	easeSineOut: -1,
	easeSineInOut: -1,
	easeElasticIn: -1,
	easeElasticOut: -1,
	easeElasticInOut: -1,
	easeBounceIn: -1,
	easeBounceOut: -1,
	easeBounceInOut: -1,
	easeBackIn: -1,
	easeBackOut: -1,
	easeBackInOut: -1,
	// easeBezierAction:-1,
	easeQuadraticActionIn: -1,
	easeQuadraticActionOut: -1,
	easeQuadraticActionInOut: -1,
	easeQuarticActionIn: -1,
	easeQuarticActionOut: -1,
	easeQuarticActionInOut: -1,
	easeQuinticActionIn: -1,
	easeQuinticActionOut: -1,
	easeQuinticActionInOut: -1,
	easeCircleActionIn: -1,
	easeCircleActionOut: -1,
	easeCircleActionInOut: -1,
	easeCubicActionIn: -1,
	easeCubicActionOut: -1,
	easeCubicActionInOut: -1,
	normal: -1
});

module.exports = easeConst;