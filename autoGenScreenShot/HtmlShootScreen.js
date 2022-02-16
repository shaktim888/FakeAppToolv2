var path = require("path");
var fs = require("fs");
var _genAdViewPicture = require("./GenAdView");
var webdriver = require('selenium-webdriver');
const MouseController = require('mouse-controller');
const mc = new MouseController();

var Utils = require("../utils");
var utils = new Utils()
var gm = require('gm');
var sizeOf = require('image-size');
var outputPath
var waitImgDir
var clickPos

var startShoot = function (htmlfile,otherconf) {
    var driver = new webdriver.Builder()
        .forBrowser('firefox')
        .build();
    var url = 'file:///' + htmlfile
    driver.get(url);
    driver.manage().window().maximize();
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    var curClickCnt = 0
    
    var delaytime = clickPos[3] ? clickPos[3] : new Array(1000, 1000, 1000);
    async function clickScreenshots() {
        await delay(delaytime[curClickCnt]);
        driver.takeScreenshot().then(function (d) {
            var dataBuffer = Buffer.from(d, 'base64');
            var waitImgPath = path.join(waitImgDir, curClickCnt + "_wait.png")
            fs.writeFileSync(waitImgPath, dataBuffer);
            //去除图片黑边
            removeBlackEdges(curClickCnt,otherconf,waitImgPath) 

            curClickCnt = curClickCnt + 1
            if (curClickCnt < 3) {
                mc.click(mc.BUTTON.LEFT, {x:clickPos[curClickCnt - 1].x,y:clickPos[curClickCnt - 1].y});
                clickScreenshots()
            }
            if (curClickCnt == 3) {
                driver.quit()
            }
        });
    }
    clickScreenshots();
}

var _genHtmlScreenShot = function (outdir,otherconf) {
    console.log("执行")
    clickPos = otherconf.clickPos
    outputPath = outdir + "/grabscreen/"
    waitImgDir = outdir + "/waitscreen/"
    utils.mkdirs(outputPath)
    utils.mkdirs(waitImgDir)
    findHmtlFile(outdir,otherconf)

}

var findHmtlFile = function (outdir,otherconf) {
    var ab_path = path.join(process.cwd(), outdir)
    if (outdir.indexOf("/Users") != -1) {
        ab_path = outdir
    }
    var files = fs.readdirSync(ab_path)
    for (var i = 0 in files) {
        let ele = files[i]
        var filepath = path.join(ab_path, ele)
        var info = fs.statSync(filepath)
        if (info.isDirectory()) {
            findHmtlFile(filepath,otherconf)
        } else {
            if ((path.extname(filepath) == ".html" || path.extname(filepath) == ".htm")) {
                console.log("截图中...")
                startShoot(filepath,otherconf)
                break
            }
        }
    }
}

function removeBlackEdges(curClickCnt,otherconf,waitImgPath){
    var size = sizeOf(waitImgPath)
    var width
    var height
    var y 
    if (clickPos[2].height > 0) {
        width = clickPos[2].width
        height = clickPos[2].height
        y = (size.height-clickPos[2].height)/2
    } 
    else {
        width = clickPos[2].width
        height = size.height
        y = 0
    }
    var x = size.width/2-clickPos[2].width/2
    var outname = path.join(outputPath, curClickCnt + ".png")
    gm(waitImgPath)
    .crop(width, height, x, y)
    .write(outname, function (err) {
        if (err) { console.log(err) } 
        else {
            var cnt = utils.getfileCount(outputPath)
            if (cnt == 3){
                _genAdViewPicture(path.resolve(outputPath,".."),otherconf)
            }
        }
    });
}


module.exports = _genHtmlScreenShot