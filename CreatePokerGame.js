var path = require("path");
var fs = require('fs');
var FakeAppTool = require("./FakePokerAppTool.js");
var Utils = require("./utils");
var utils = new Utils();
var config = require('./config');
const define = require("./define");

function CreatePokerGame() {
    this.start =function(hallViewStyle){
           
            let game_path = path.join(define.GAME_RES_PATH, config.PACKAGE_GAME_NAME)
            let demo_path = path.join(game_path, define.DEMO_PATH)
            let src_path = path.join(demo_path, "/src/", "logic", "views")
            let res_path = path.join(demo_path, "/res/","dynamic")
            this.randLayout(hallViewStyle,res_path,src_path)
            this.mergeRandLayoutJsonToGenGame(hallViewStyle)

    };

    this.mergeRandLayoutJsonToGenGame = function(hallViewStyle) {
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
            "style": config.PACKAGE_GAME_STYLE,
            "appName":config.PACKAGE_GAME_NAME,
            "grabscreen_path":define.GRABSCREEN_PATH,
        }
        for (ele in commonCfg){
            otherConfData.other[ele] = commonCfg[ele]
        }
        let fakeAppTool = new FakeAppTool();
        fakeAppTool.start(resData,GameName,otherConfData.confuse,otherConfData.other);
    };

    this.randLayout = function(hallViewStyle, dest_res_path, dest_src_path){
       
        if (fs.existsSync(dest_res_path)) {
            utils.removeDir(dest_res_path);
        }
        
        let hall_src_path = path.join(dest_src_path,"GameStart")
        if (fs.existsSync(hall_src_path)){
            utils.removeDir(hall_src_path);
        }

        let copy_path = `../${hallViewStyle}/Layout/`
        let Conf = path.join(copy_path,"map.json")
        let confData = JSON.parse(fs.readFileSync(Conf));
        //拷贝模板到对应游戏目录
        confData.forEach(ele =>{
            let component = ele.component
            let component_path = copy_path
            if(ele.parent_directory){
                component_path = path.join(copy_path, ele.parent_directory)
                component_path = path.join(component_path,component)
              
            }
            else{
                let game_isL =  (define.isL()) == true ? "heng" : "shu"
                component_path = path.join(copy_path, game_isL)
                component_path = path.join(component_path, component)
            }
           
           
            let res_des_lua_path = ele.dest_component_lua_name
            let selectDirection =  ele
            let style_list = selectDirection.styles
            if (style_list){
                let item  = utils.getRandEle(style_list)
                console.log(component,item.src)
                let item_res_path = path.join(component_path, "style_res", item.res.style)
                let item_src_path = path.join(component_path, "style_src", item.src)
                utils.CopyDirectory(item_res_path, dest_res_path) 
                utils.CopyDirectory(item_src_path, dest_src_path) 
                //改名（将["Start_Layer_0.lua","Start_Layer_1.lua","Start_Layer_2.lua"] ==> Start_Layer.lua)
                if (item.res.layout){
                    let item_select_lua_res = utils.getRandEle(item.res.layout)
                    let curPath = path.join(dest_res_path,component,item_select_lua_res)
                    let newPath = path.join(dest_res_path,component,res_des_lua_path)
                    fs.renameSync(curPath,newPath)

                    if(item_select_lua_res =="Setting_1.lua"){
                        let src_path = path.join(component_path, "style_src", "style1")
                        utils.CopyDirectory(src_path, dest_src_path) 
                    }

                    if(item_select_lua_res =="Setting_2.lua"){
                        let src_path = path.join(component_path, "style_src", "style2")
                        utils.CopyDirectory(src_path, dest_src_path) 
                    }
                }
            }else{
                utils.CopyDirectory(component_path, dest_res_path) 
            }
        })
    }
}
module.exports = CreatePokerGame;




