var path = require("path");
var fs = require('fs');
var FakeAppTool = require("./FakeAppTool.js");
var Utils = require("./utils");
var utils = new Utils();
var config = require('./config');
const define = require("./define");

var CreatePokerGame = require("./CreatePokerGame.js");

checkHasGame()
function checkHasGame(){
    //拉取公共库
    utils.comomGitPull(define.GAME_RES_PATH, define.COMMON_RES, function(){
        utils.comomGitPull(define.GAME_RES_PATH, config.PACKAGE_GAME_NAME, function(){
            generateGame()
        })
    })
}

//generateGame()
function generateGame(){
    //是否进行多样化布局
    var hallViewStyle = define.GAME_STYLE_TABLE[config.PACKAGE_GAME_STYLE].hall_layout
  
    if(hallViewStyle) {
        if (config.PACKAGE_GAME_STYLE == "style_Poker" && define.UsePokerLayoutList()){

            utils.comomGitPull("../", hallViewStyle, function(){
                let a = new CreatePokerGame();
                a.start(hallViewStyle);
            })
            return
        }
    }

    if (hallViewStyle && define.UseLayoutList()) {
        utils.comomGitPull("../", hallViewStyle, function(){
            let game_path = path.join(define.GAME_RES_PATH, config.PACKAGE_GAME_NAME)
            let demo_path = path.join(game_path, define.DEMO_PATH)
            let src_path = path.join(demo_path, "/src/", "logic", "views")
            let res_path = path.join(demo_path, "/res/","dynamic")
           
            randLayout(hallViewStyle,res_path,src_path)
            mergeRandLayoutJsonToGenGame(hallViewStyle)
        })
    }else{
        readLocalJsonToGenGame()
    }
}

function readLocalJsonToGenGame(){
    var GameName = define.GAME_RES_PATH + config.PACKAGE_GAME_NAME
    let confpath = `${GameName}/project.json`;
    if (config.PACKAGE_GAME_STYLE == "style_Other") {
        confpath = `${GameName}/Arts/style_Other/project.json`;
    }
    let confdata = JSON.parse(fs.readFileSync(confpath));
    if (!confdata) {
        console.error('not exist confpath')
    }
    let modules = confdata.modules;
    let other = confdata.other;
    let commonCfg =  {
        "apppath":GameName,
        "style": config.PACKAGE_GAME_STYLE,
        "appName":config.PACKAGE_GAME_NAME,
        "grabscreen_path":define.GRABSCREEN_PATH,
        "archive_dir":define.ARCHIVE_DIR,
        "produceicon_hallbgRole":define.ICON_ROLE_PATH,
    }
    for (ele in commonCfg){
        other[ele] = commonCfg[ele]
    }
    let fakeAppTool = new FakeAppTool();
    fakeAppTool.start(modules,GameName,confdata.confuse, other);
}

function mergeRandLayoutJsonToGenGame(hallViewStyle) {
    
    var GameName = define.GAME_RES_PATH + config.PACKAGE_GAME_NAME
    let Conf = `../${hallViewStyle}/Layout/map.json`
    let confData = JSON.parse(fs.readFileSync(Conf));
    let itemConfList = [`${GameName}/demo/res/A.json`]
    confData.forEach(ele =>{
        let arr =  `${GameName}/demo/res/dynamic/${ele.component}/A.json`
        itemConfList.push(arr)
    })

    let eleData = []
    itemConfList.forEach(ele =>{
        if (fs.existsSync(ele)){
            let eleJson = JSON.parse(fs.readFileSync(ele))
            eleData.push(eleJson)
        } 
    })
    let resData = Object.assign(eleData[0],eleData[1],eleData[2],eleData[3],eleData[4])
    fs.writeFileSync("./AA3aaaa.json",  JSON.stringify(resData,null,4))

    let otherConf = `${GameName}/demo/res/A_others.json`;
    let otherConfData = JSON.parse(fs.readFileSync(otherConf));
    let commonCfg =  {
        "apppath":GameName,
        "appName":config.PACKAGE_GAME_NAME,
        "style": config.PACKAGE_GAME_STYLE,
        "grabscreen_path":define.GRABSCREEN_PATH,
    }
    for (ele in commonCfg){
        otherConfData.other[ele] = commonCfg[ele]
    }
    let fakeAppTool = new FakeAppTool();
    fakeAppTool.start(resData,GameName,otherConfData.confuse,otherConfData.other);
}



function randLayout(hallViewStyle, dest_res_path, dest_src_path){
    let game_isL =  (define.isL()) == true ? "heng" : "shu"
    let copy_path = `../${hallViewStyle}/Layout/`
    let Conf = path.join(copy_path,"map.json")
    let confData = JSON.parse(fs.readFileSync(Conf));
    
    if (fs.existsSync(dest_res_path)) {
        utils.removeDir(dest_res_path); //清除原有加载资源
    }
    
    let hall_src_path = path.join(dest_src_path,"GameStart")
    if (fs.existsSync(hall_src_path)){
        utils.removeDir(hall_src_path); //清除原有加载资源
    }
    // utils.mkdirs(dest_res_path)
    // utils.mkdirs(hall_src_path)
    
    //拷贝模板到对应游戏目录
    confData.forEach(ele =>{
        let component = ele.component
        let isL = ele.isL_Field == true ? game_isL : ""
        let component_path = path.join(copy_path, component)
        let res_des_lua_path = ele.dest_component_lua_name
        let selectDirection = ele[isL] || ele
        let style_list = selectDirection.styles
        if (style_list){
            let item  = utils.getRandEle(style_list)
            console.log(component,item.src)

            let item_res_path = path.join(component_path, isL, "style_res", item.res.style)
            let item_src_path = path.join(component_path, isL, "style_src", item.src)
            
            utils.CopyDirectory(item_res_path, dest_res_path) 
            utils.CopyDirectory(item_src_path, dest_src_path) 

            //改名（将["Start_Layer_0.lua","Start_Layer_1.lua","Start_Layer_2.lua"] ==> Start_Layer.lua)
            if (item.res.layout){
                let item_select_lua_res = utils.getRandEle(item.res.layout)
                let curPath = path.join(dest_res_path,component,item_select_lua_res)
                let newPath = path.join(dest_res_path,component,res_des_lua_path)
                fs.renameSync(curPath,newPath)
            }
        }else{
            utils.CopyDirectory(component_path, dest_res_path) 
        }
    })
        
}




