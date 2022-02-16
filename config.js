

module.exports = {
	PACKAGE_COUNT:process.argv[2] || 2,
	PACKAGE_GAME_STYLE:process.argv[3] || "style_Poker",
	PACKAGE_GAME_NAME:process.argv[4] || "Poke_jingji",
	IS_TEST:false,
	IS_ORDER:false,
	IS_BACKTRACE : false, //是否回档
	IS_ARCHIVE : false,    
	IS_MMD5:false, 
	IS_COMPRESS:true,
    IS_ICON : true, 
	IS_SCREENSHOT:true, 
	IS_DESC:true,
	IS_CLIENT:false,
	SLEEP_TIME:0,
	COCOSCREATOR_PLATFORM:"ios" //1.web-mobile     2.ios
}