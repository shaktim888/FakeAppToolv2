var path = require("path");
var fs = require("fs");

const { execSync } = require('child_process');
var gm = require("gm")
var Utils = require("../utils");
var utils = new Utils();
var AD_VIEW_NAME = "AutoShowTool"
var AD_VIEW_PATH = "../AutoShowTool"
const define = require("../define")
const config = require("../config");
function _genAdViewPicture(outdir, otherconf) {
    utils.mkdirs(AD_VIEW_PATH)
    utils.comomGitPull("../", AD_VIEW_NAME, function(){
        console.log('pull ad_view_res success !!!!')
        execSync("npm install",{cwd:AD_VIEW_PATH})
        useScreenShot(outdir,otherconf)
    })
}

function useScreenShot(outdir,otherconf){
    var ad_view_style = define.GAME_STYLE_TABLE[otherconf.style].id
    var bUseGameRole  = define.GAME_STYLE_TABLE[otherconf.style].bUseGameRole
    let grabscreen_path = path.join(outdir, otherconf.grabscreen_path)
    var ad_view_enter = path.resolve(path.join(AD_VIEW_PATH,"screenshot.js"))
    var _genScreenShot = require(ad_view_enter)
    var ad_view_out = path.join(outdir,"ad_view")
    utils.mkdirs(ad_view_out)
    var gameStyle = otherconf.style
    var rotate = 0
    var outProtoRole = null
    if(bUseGameRole){
        let proto_role = path.join(outdir, "firstRole.png")
        outProtoRole = path.join(outdir,"outProtoRole.png")
        gm(proto_role).resize(null,1200).write(outProtoRole,function(err){
            if(err){console.log(err)}
            _genScreenShot(gameStyle, grabscreen_path, ad_view_out, outProtoRole)
            fs.unlinkSync(proto_role)
        })
    }
    else{
        _genScreenShot(gameStyle, grabscreen_path, ad_view_out, outProtoRole)
    }
    
}




module.exports = _genAdViewPicture