//const {exec} = require('child_process');

var fs = require('fs');
var path = require("path");
var execSync= require('child_process').execSync;
var gm = require('gm')
var imagesSize = require("image-size");
var makeLaunchutils = require("../autoMakeLaunchScreen/makelaunch.js")
var RecordState = require("../recordState/recordState");
var Utils = require("../utils");
var utils = new Utils()
var random = require("string-random")
var config = require("../config")
var define = require("../define")
var iconArray = [
    "icon-20@2x.png",
    "icon-20@3x.png",
    "icon-29.png",
    "icon-29@2x.png",
    "icon-29@3x.png",
    "icon-40@2x.png",
    "icon-40@3x.png",
    "icon-57.png",
    "icon-57@2x.png",
    "icon-60@2x.png",
    "icon-60@3x.png",
    "icon-20-ipad.png",
    "icon-20@2x-ipad.png",
    "icon-29-ipad.png",
    "icon-29@2x-ipad.png",
    "icon-40.png",
    "icon-40@2x.png",
    "icon-50.png",
    "icon-50@2x.png",
    "icon-72.png",
    "icon-72@2x.png",
    "icon-76.png",
    "icon-76@2x.png",
    "icon-83.5@2x.png",
    "icon-1024.png",
];

var pixelArray = [
    40,60,29,58,87,80,120,57,114,120,180,20,40,29,58,40,80,50,100,72,144,76,152,167,1024
];

var fileContents = "\
{\
    \"images\": [\
        {\
            \"size\": \"20x20\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-20@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"20x20\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-20@3x.png\",\
            \"scale\": \"3x\"\
        },\
        {\
            \"size\": \"29x29\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-29.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"29x29\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-29@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"29x29\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-29@3x.png\",\
            \"scale\": \"3x\"\
        },\
        {\
            \"size\": \"40x40\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-40@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"40x40\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-40@3x.png\",\
            \"scale\": \"3x\"\
        },\
        {\
            \"size\": \"57x57\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-57.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"57x57\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-57@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"60x60\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-60@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"60x60\",\
            \"idiom\": \"iphone\",\
            \"filename\": \"icon-60@3x.png\",\
            \"scale\": \"3x\"\
        },\
        {\
            \"size\": \"20x20\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-20-ipad.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"20x20\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-20@2x-ipad.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"29x29\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-29-ipad.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"29x29\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-29@2x-ipad.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"40x40\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-40.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"40x40\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-40@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"50x50\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-50.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"50x50\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-50@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"72x72\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-72.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"72x72\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-72@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"76x76\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-76.png\",\
            \"scale\": \"1x\"\
        },\
        {\
            \"size\": \"76x76\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-76@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"83.5x83.5\",\
            \"idiom\": \"ipad\",\
            \"filename\": \"icon-83.5@2x.png\",\
            \"scale\": \"2x\"\
        },\
        {\
            \"size\": \"1024x1024\",\
            \"idiom\": \"ios-marketing\",\
            \"filename\": \"icon-1024.png\",\
            \"scale\": \"1x\"\
        }\
    ],\
    \"info\": {\
        \"version\": 1,\
        \"author\": \"icon.wuruihong.com\"\
    }\
}\
"
var genIconAndLaunchScreen = function(outputPath,otherconf){
    var iconStyle = define.GAME_STYLE_TABLE[otherconf.style].icon
    iconStyle.forEach(ele => {
        if (ele == "style_TongYong" ) {
            var outCustomPath = path.join(outputPath,"Icon","RoleIcon")
            utils.mkdirs(outCustomPath)

            //配置人物icon(不存在就去拿大厅的生成)
            
            var rolePicName = path.join(outputPath,otherconf.produceicon_hallbgRole)

            if (!fs.existsSync(rolePicName)){
                var resizeIconPath = path.join(outputPath,"iconRole.png")
                execSync("mv " + resizeIconPath + " " + outCustomPath)
            }

            var hallbgPath = path.join(outputPath, "hallbg.png")
            execSync("mv " + hallbgPath + " " + outCustomPath)
           
            customMode(rolePicName,outCustomPath,otherconf)
        }
        else{
            var outSelectPath = path.join(outputPath,"Icon","StyleIcon")
            utils.mkdirs(outSelectPath)
            takeOutMode(ele,outSelectPath,otherconf)
        }
    });
}

function takeOutMode (iconStyle,outputPath,otherconf){
    var AUTO_ICON_PATH = "../AutoGenIcon"
    var BUILD_NUMBER = random(10)
    var enterGenIcon = path.resolve(path.join(AUTO_ICON_PATH,"index.js"))
    var outIconPath = path.resolve(path.join(AUTO_ICON_PATH,"output",BUILD_NUMBER))
    console.log("开始制作icon" + enterGenIcon + " " + iconStyle)
    execSync("node " + enterGenIcon + " " + iconStyle + " " + BUILD_NUMBER)
    execSync("cp -r " + outIconPath + "/. " + outputPath)
    var iconPath = path.join(outputPath,"icon.png")
    makeLaunchutils(outputPath,iconPath,otherconf)	
}

function customMode(rolePicName,outputPath,otherconf){
    var aimBgPicName =  path.join(outputPath, "hallbg.png")
   
    if (!fs.existsSync(rolePicName)){
        rolePicName = path.join(outputPath, "resizeIconRole.png")
        let proto_role = path.join(outputPath, "iconRole.png")
        gm(proto_role)
        .resize(null,1024,"!")
        .write(rolePicName,function(err){
            if(err){console.log(err)}
            console.log("剪切icon人物成功")
            fs.unlinkSync(proto_role)
            mergeBgAndRole(aimBgPicName,outputPath,rolePicName,otherconf)
        })
    }else{
        mergeBgAndRole(aimBgPicName,outputPath,rolePicName,otherconf)
    }
}
function mergeBgAndRole(aimBgPicName,outputPath,rolePicName,otherconf){
    var outPath = path.join(outputPath, "AppIcon.appiconset");
    utils.mkdirs(outPath);
	var aimBgPic = imagesSize(aimBgPicName);
	var cutWidth = 0;
	var cutHeight = 0;
	var aimSize = 1024;

	if( aimBgPic.width >aimBgPic.height){
		cutWidth = aimBgPic.height;
		cutHeight = aimBgPic.height;
	}
	else{
		cutWidth = aimBgPic.width;
		cutHeight = aimBgPic.width;
	}

	var aimPicStartX = (aimBgPic.width- cutWidth)/2;
    var aimPicStartY = (aimBgPic.height- cutHeight)/2;

    //裁剪图片
    var tempName = "test.png";
    var iconName = "icon.png";
	var tempAimName= path.join(outPath, tempName);
	gm(aimBgPicName)
	.crop(cutWidth,cutHeight,aimPicStartX,aimPicStartY)
	.resize(aimSize,aimSize)
	.write(tempAimName, function(err) {
		if (!err) {
            console.log("剪切icon图片");
			//合成图片
			var aimRolePic = imagesSize(rolePicName)
			var moveX = aimSize/2 - aimRolePic.width/2;
			var moveY = aimSize - aimRolePic.height;
            var newPath = path.join(outPath, iconName);
            var outName = path.join(outputPath,iconName)
			gm()
			.in('-page', '+0+0')
        	.in(tempAimName)
        	.in('-page', "+" + moveX + "+" + 0)
        	.in(rolePicName)
        	.mosaic()
       		.write(outName, function (err) {
				if (!err) {
                    console.log("合成icon图片");
                    fs.unlinkSync(aimBgPicName)
                    fs.unlinkSync(rolePicName)
                    fs.copyFileSync(outName, newPath)
                    formatAppIcon(outPath, iconName)	
                    makeLaunchutils(outputPath,outName,otherconf)
				} 
				else {
		  			console.log(err.message || "step2合成出错了！");
		  			return;
				}
        	})	
		} 
		else {
			  console.log(err.message || "step1裁剪出错了！");
			  return;
		}
	})
}

function formatAppIcon(iconDir, bigestSizeImage){
	// iconDir = iconDir +"/output"
    _make();
    console.log("icon制作成功")
    function _make(){
        execSync("cp \""+iconDir+"/"+bigestSizeImage+"\" \""+iconDir+"/../\"")
        //去除alpha通道
        execSync("convert "+"\""+iconDir+"/../"+bigestSizeImage+"\" -background white -alpha remove -alpha off -resize 1024x1024 "+"\""+iconDir+"/../"+bigestSizeImage+"\"");
        execSync("rm -rf "+iconDir+"/*");
        _makeImage(0);
        function _makeImage(i){
            if(i==iconArray.length) return;
            gm(iconDir+"/../"+bigestSizeImage)
            .resize(pixelArray[i],pixelArray[i],'!')
            .noProfile()
            .write(iconDir+"/"+iconArray[i], function (err) {
                if (err) console.log(err)
                _makeImage(i+1);
            });
        }

        fs.writeFileSync(iconDir+"/Contents.json",fileContents);
        
        
    }
}

module.exports = genIconAndLaunchScreen;

