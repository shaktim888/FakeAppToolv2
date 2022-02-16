var fs = require('fs');
var path = require("path");
const { execSync } = require('child_process');
var confuseCodeAndRes = require("./confuseLua/Confuse");
var genIconAndLanchScreen = require("./autoGenIcon/makeIcon");
var genScreenShots = require("./autoGenScreenShot/ScreenShots");
var recordState = require("./recordState/recordState");
var ProduceDescTool = require("./autoGenDescription/ProduceDescTool");
let desctool = new ProduceDescTool();
var Utils = require("./utils");
var utils = new Utils();
var config = require("./config");
var define = require('./define');

function FakeAppTool() {
    this.start = function (modules,name,confuseconf, otherconf) {
        global.ISL = otherconf.isL
        let artPath = path.join(name,define.ARTS_PATH)
        let apppath = path.join(name,define.DEMO_PATH)
        if (config.IS_TEST){
            utils.removeDir(define.OUT_PATH);
        }
        this.global_index = 10000;
        this.modules = modules
        let artStylePath = path.join(artPath, otherconf.style);
        if (!fs.existsSync(artStylePath)) {
            throw "This game type does not exist"
        }
        if (config.IS_BACKTRACE){
            recordState.backtrace(artPath)
        }
        if (config.IS_ARCHIVE) {
            this.checkFileState(otherconf,artStylePath)
        }
        const sleep = function (time) {
            var promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, time);
            });
            return promise;
        }
        var self = this
        async function genPkgSync() {
            for (var i = 0; i < config.PACKAGE_COUNT; i++) {
                let index = i.toString()
                if (Math.floor(i / 10) == 0) {
                    index = "0" + i
                }
                var outPath = path.join(define.OUT_PATH,config.PACKAGE_GAME_STYLE,config.PACKAGE_GAME_NAME,process.argv[5] || "testYCF")
                this.curOutdir = path.join(outPath, index);
                utils.mkdirs(this.curOutdir)

                self.curOutdir = this.curOutdir
                self.gameRole = null
                self.produceicon_hallbg = null
                self.global_index = self.global_index + 1;
                self.exportApp(self.modules, artStylePath);
                self.copyFilesForExportApp(apppath, this.curOutdir);

                //提前将所需文件的大厅背景与人物复制出来以备做自动icon
                if (otherconf.proto_role || self.gameRole){
                    let proto_role = path.join(self.curOutdir, otherconf.proto_role || self.gameRole)
                    if (fs.existsSync(proto_role)){
                        execSync("cp " + proto_role + " " + this.curOutdir + "/firstRole.png")
                        execSync("cp " + proto_role + " " + this.curOutdir + "/iconRole.png")

                    }
                }
                var iconStyle = define.GAME_STYLE_TABLE[otherconf.style].icon
                var isIncludeTongYong = iconStyle.find(ele => {
                    return ele == "style_TongYong"
                })
                if (isIncludeTongYong == "style_TongYong"){
                    let hallbg = path.join(self.curOutdir, otherconf.produceicon_hallbg || self.produceicon_hallbg)
                    if (fs.existsSync(hallbg)){
                        execSync("cp " + hallbg + " " + this.curOutdir + "/hallbg.png")

                    }
                }

                self.createAdditionalFile(this.curOutdir, otherconf)
                if (!define.isKeKeIgnoreListFunc()){
                    confuseCodeAndRes(apppath, this.curOutdir, confuseconf, index, outPath)
                }
                if(name.indexOf("Creator") != -1){
                    self.creatorCompile()
                }
                if (i == config.PACKAGE_COUNT - 1) {
                    if (config.IS_ARCHIVE) {
                        self.updateFileState(artStylePath,name)
                    }
                }
                await sleep(config.SLEEP_TIME);
            }
        }
        genPkgSync();
    };


    //生成附加文件（Icon,描述,宣传图）
    this.createAdditionalFile = function (outdir, otherconf) {
        if(config.IS_DESC && !define.isKeKeIgnoreListFunc()){
            desctool.writeDesc(outdir, otherconf)
        }
        if(config.IS_ICON){
            genIconAndLanchScreen(outdir, otherconf);
        }
        if(config.IS_SCREENSHOT && !define.isKeKeIgnoreListFunc()){
            genScreenShots(outdir, otherconf)
        }
    }

    //原始取资源方法
    this.chooseAFileBack = function (workpath, globalindex, order) {
        if (order == undefined) {
            order = 0;
        }
        var count = utils.getfileCount(workpath);
        var t_index
        if (order == 0) {
            if (count < globalindex) {
                var randomindex = utils.GetRandomNum(0, count - 1);
                t_index = randomindex
            } else {
                t_index = globalindex - 1
            }
        } else {
            t_index = globalindex % count
        }
        var retf = utils.getfileFilterDS_Store(workpath, t_index);
        // console.log(workpath,retf,t_index)
        return retf;
    }

    this.chooseStyle = function (workpath, obj, IS_ARCHIVE) {
        var order = 0
        if (config.IS_ORDER){
            if (obj && obj.hasOwnProperty("order")) {
                order = parseInt(obj["order"])
            }
        }
        if (IS_ARCHIVE) {
            return recordState.archive(workpath, false)
        } else {
            return this.chooseAFileBack(workpath, this.global_index, order)
        }
    }
    this.checkFileState = function(otherconf,artStylePath){
        // var index = name.lastIndexOf("\/")
        // let str = name.substring(index + 1, name.length)
        let valid_count = recordState.preCheck(this.modules[define.ARCHIVE_DIR], path.join(artStylePath, define.ARCHIVE_DIR))
        this.stateCfg = {
            name: config.PACKAGE_GAME_NAME,
            style: config.PACKAGE_GAME_STYLE,
            styleName: define.GAME_STYLE_TABLE[config.PACKAGE_GAME_STYLE].name,
            minCount: valid_count,
            dir_structure: otherconf.dir_structure
        }
        this.stateCfg.minCount = valid_count
        this.stateCfg.isLock = true
        recordState.update(this.stateCfg)
        if (valid_count == 0) {
            console.error("无可用资源")
            return
        }
        if (config.PACKAGE_COUNT > valid_count) {
            config.PACKAGE_COUNT = valid_count
            console.log("生产值已经改为最小值", valid_count)
        }
        //重置存档次数(控制回档)
        recordState.reset(artStylePath);
    }

    this.updateFileState = function(artStylePath,name){
        this.stateCfg.minCount = recordState.preCheck(this.modules[define.ARCHIVE_DIR], path.join(artStylePath, define.ARCHIVE_DIR))
        this.stateCfg.isLock = false
        recordState.update(this.stateCfg)
        //提交
        let shellFile = "./recordState/git.sh"
        execSync("sh " + shellFile + " " + name)
    }
    this.creatorCompile = function(){
        let platform = ""
        if(config.COCOSCREATOR_PLATFORM=="web-mobile"){
            platform = "web-mobile"
        }
        else if(config.COCOSCREATOR_PLATFORM=="ios"){
            platform = "jsb-link"
        }
        let workPath = path.join(this.curOutdir,config.PACKAGE_GAME_NAME)
        console.log(`/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --path ${workPath} --build "platform=${config.COCOSCREATOR_PLATFORM};debug=false"`)
        execSync(`/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --path ${workPath} --build "platform=${config.COCOSCREATOR_PLATFORM};debug=false"`)
        let buildPath = path.join(workPath,"build",platform)
        let destPath = path.join(this.curOutdir,"game")
        utils.mkdirs(destPath)
        utils.CopyDirectory(buildPath,destPath)
        utils.removeDir(workPath)
    }
    this.copyFilesForExportApp = function (srcpath, destpath) {
        var files = fs.readdirSync(srcpath);
        for (var i in files) {
            let ele = files[i];
            if (path.basename(ele) != define.EXCLUDE_FILENAME_DS_STORE) {
                let temp = path.join(srcpath, ele)
                var f = fs.statSync(temp);
                if (f.isDirectory()) {
                    var dest = path.join(destpath, ele)
                    if (!fs.existsSync(dest)) {
                        utils.mkdirs(dest);
                    }
                    this.copyFilesForExportApp(temp, dest);
                } else if (f.isFile()) {
                    var dest = path.join(destpath, ele)
                    if (!fs.existsSync(dest)) {
                        fs.copyFileSync(temp, dest);
                    }
                }
            }
        };
        return false;
    }

    this.exportApp = function (jsondata, workpath) {
        // 遍历模块  hall, subgame, head...
        let IS_ARCHIVE = false
        for (var key in jsondata) {
            if (config.IS_ARCHIVE) {
                if (key == define.ARCHIVE_DIR) {
                    IS_ARCHIVE = true;
                } else {
                    IS_ARCHIVE = false
                }
            }
            if (key == "common_res") {
                workpath = define.GAME_RES_PATH
            }


            let eleData = jsondata[key]
            //对多样化布局进行特殊处理（如果key 为多样化布局则更改源目录与 子数据)
            var hallViewStyle = define.GAME_STYLE_TABLE[config.PACKAGE_GAME_STYLE].hall_layout
            if (hallViewStyle && define.UseLayoutList()){
                global.ISL = define.isL()

                let isL = ISL == true ? "heng" : "shu"
                if (key == "common"){
                    workpath = `../${hallViewStyle}/Common/`
                    key = ""
                }
                else if( key == "game_layer"){

                }
                else if (key == "Special"){
                    workpath = `../${hallViewStyle}/Special/${isL}`
                    key = ""
                }
                else{
                    let Conf = `../${hallViewStyle}/Layout/map.json`
                    let confData = JSON.parse(fs.readFileSync(Conf));
                    confData.forEach(ele =>{
                      if (ele.component == key && !ele.isL_Field ) {
                          isL = ""
                      }
                    })
                    workpath = `../${hallViewStyle}/GameRes/${key}/${isL}`
                    console.dir(eleData)
                    for (var childKey in eleData) {
                        eleData =  eleData[childKey]
                        key = childKey
                        break
                    }
                }   
            }
            this.handleModules(eleData,path.join(workpath, key), IS_ARCHIVE)
        }
    }

    this.handleModules = function (moduledata, workpath, IS_ARCHIVE) {
        for (var key in moduledata) {
            if (key != "order" && key != "common_res" && key != "select") {
                
                var obj = moduledata[key];
                if (key == "role"){
                    this.gameRole = obj["relpath"]
                }
                if (key == "bg"){
                    this.produceicon_hallbg = obj["relpath"]
                }
                if (key == "sound"){
                    key = define.GAME_STYLE_TABLE[config.PACKAGE_GAME_STYLE].bgm
                }
                if (obj.hasOwnProperty("select")){ key = utils.getRandEle(obj.select)}
                console.log(key)
                if (obj.hasOwnProperty("relpath")) {
                    // 就是这个模块了
                    var order = 0
                    if (config.IS_ORDER){
                        if (obj.hasOwnProperty("order")) {
                            order = parseInt(obj["order"])
                        }
                    }
                    var subpath = path.join(workpath, key)
                    console.log(subpath)
                    if ( !fs.existsSync(subpath)){
                        subpath = define.getShareFile(key)
                    } else {
                        var cnt = 0;
                        var files = fs.readdirSync(subpath)
                        files.forEach((filename, index) => {
                            let pathname = path.join(subpath, filename)
                            let stats = fs.statSync(pathname)
                            if (stats.isFile()) {
                                cnt++;
                            }
                        });
                        if(cnt == 0) {
                            subpath = define.getShareFile(key);
                        }
                    }
                    this.getFile(subpath, obj["relpath"], order, IS_ARCHIVE);
                } else {
                    var obj = moduledata[key];
                    if (obj.hasOwnProperty("select")){ key = utils.getRandEle(obj.select)}
                    let tmppath = path.join(workpath, key);
                    console.log("group =",tmppath)
                    if ( !fs.existsSync(tmppath)){
                        tmppath = define.getShareFile(key)
                    }
                    let style = this.chooseStyle(tmppath, obj, IS_ARCHIVE);
                    this.handleModules(obj, path.join(tmppath, style), false);
                }
            }
        }
    }

    this.getFile = function (workpath, destpath, order, IS_ARCHIVE) {
        var retf
        if (IS_ARCHIVE) {
            retf = recordState.archive(workpath, false);
        } else {
            retf = this.chooseAFileBack(workpath, this.global_index, order)
        }
        var src_path = path.join(workpath, retf);
        var src_info = fs.statSync(src_path);
        if (src_info.isDirectory()) {
            throw (src_path + " is Directory! not copied!");
        }
        var des_abspath = path.join(this.curOutdir, destpath);
        var des_parentpath = path.dirname(des_abspath);
        if (!fs.existsSync(des_parentpath)) {
            utils.mkdirs(des_parentpath);
        };
        // console.log(src_path,des_abspath)
        fs.copyFileSync(src_path, des_abspath);
    }
   
}

module.exports = FakeAppTool;

