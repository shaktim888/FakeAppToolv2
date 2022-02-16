//const {exec} = require('child_process');
var fs = require('fs');
var path = require("path");
var sizeOf = require('image-size');
var tools = require("../utils")
var execSync= require('child_process').execSync;
var gm = require('gm')
let tool = new tools();


var GetRandomNum = function(Min,Max){
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
}

var getRandNum = function(path){
	var count = tool.getfileCount(path);
	var randomindex = GetRandomNum(0, count - 1);
	return randomindex
}

var _genMakeLaunch = function(outputpath,icon_path,otherconf){
    var inputPath = path.join(path.dirname(__filename), "input")
    var bgImg = path.join(inputPath,"LaunchScreenBackground.png");
    // var itempath = path.join(inputPath,"items");
    // var rand_count = getRandNum(itempath)
    // var item = tool.getfileFilterDS_Store(itempath,rand_count)
    var itemImg = path.resolve(icon_path)

    var outPath = path.join(outputpath,"LaunchScreenBackground.png") 

    // if (!gameconfig_path){
    //     gameconfig_path = "src/haoyue/config.lua"
    // }
    // var gameconfig =  fs.readFileSync(gameconfig_path, "utf8");
    // let str = fs.readFileSync(gameconfig_path, "utf8");

    // var reg = /width\d\d\d
    // var regExp = new RegExp("width\\s{0,}=\\s{0,}(\\d+),[\\s\\S]+height\\s{0,}=\\s{0,}(\\d+)","m");// ([\\s\\S]+?)height=\\s{0,}=\\s{0,}\\d+", "m");
    // console.log(str.match(regExp));//0123-88752314;
    // var newStr = str.match(regExp)
    var width
    var height  

    if (otherconf.isL){
        width = 2208
        height = 1242
    }else{
        width = 1242
        height = 2208
    }
    

    // var itemPath = `image Over ${width/2-sizeOf(itemImg).width/2/3},${height/2-sizeOf(itemImg).height/2/3},${sizeOf(itemImg).width/3},${sizeOf(itemImg).height/3},"${itemImg}"`; 
    var itemPath = `image Over ${width/2-150},${height/2-150},${300},${300},"${itemImg}"`; 

    gm(bgImg).resize(width, height, '!')
        .draw(itemPath)
        .write(outPath, function (err) {
            if (!err) 
            {
                console.log(outPath)
                console.log("启动图制作成功");
                // exec('open ' + outPath);
            } 
            else 
            {
                console.log(err.message || "出错了！" + i);

            }
        });
    



}

module.exports = _genMakeLaunch;

