var path = require("path");
var _genAdViewPicture = require("./GenAdView");
var _genHtmlScreenShot = require("./HtmlShootScreen");
var _GenLuaShootScreen = require("./LuaShootScreen");
var _genLuaShootScreen = new _GenLuaShootScreen();


function genScreenShots(outdir, otherconf) {
    var apppath = otherconf.apppath
    if (apppath.indexOf("H5") == -1) {
        _genLuaShootScreen.startGrabScreen(outdir, otherconf.isL);
        _genAdViewPicture(outdir, otherconf)
    }
    // var canNotShotGames = ["h5_threekingdoms","h5_pintu","H5_Ghost"]
    // if (apppath.indexOf("H5") != -1 ) {
    //     var times = 0
    //     canNotShotGames.forEach((e) => {
    //         if(apppath.indexOf(e) == -1){
    //             times = times + 1
    //             if(times == canNotShotGames.length){
    //                 _genHtmlScreenShot(outdir,otherconf)
    //             }
    //         }
    //     })
       
    // }
}

module.exports = genScreenShots