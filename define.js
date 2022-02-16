
const path = require('path')
const fs = require('fs')
var config = require("./config");

module.exports = {
    GAME_STYLE_TABLE : {
        "style_Football":    { id: 16, bUseGameRole:false, name: "足   球", bgm:"sound", dec:"style_TiYu",     icon:["style_Football"]},
        "style_Basketball":  { id: 16, bUseGameRole:false, name: "篮   球", bgm:"sound", dec:"style_TiYu",     icon:["style_Basketball"]},
        "style_Other"   :    { id:  1, bUseGameRole:false, name: "其   他", bgm:"sound", dec:"style_TongYong", icon:["style_TongYong"]},
        "style_XianXia" :    { id:  6, bUseGameRole:false, name: "仙   侠", bgm:"sound",  dec:"style_TongYong", icon:["style_TongYong"]},
        "style_QXianXia":    { id:  6, bUseGameRole:false, name: "Q仙  侠", bgm:"sound",  dec:"style_TongYong", icon:["style_QXianXia"], hall_layout:"A_XianXia_QBan_Res"},
        "style_SanGuo"  :    { id:  7, bUseGameRole:false, name: "三   国", bgm:"sound",  dec:"style_SanGuo",  icon:["style_SanGuo"]},
        "style_XiYou"   :    { id:  8, bUseGameRole:false, name: "西   游", bgm:"sound",  dec:"style_XiYou",   icon:["style_TongYong"]},
        "style_BuYu"    :    { id:  9, bUseGameRole:false, name: "捕   鱼", bgm:"sound",  dec:"style_BuYu",    icon:["style_TongYong"]},
        "style_ChuanQi" :    { id: 10, bUseGameRole:false, name: "传   奇", bgm:"sound",  dec:"style_ChuanQi", icon:["style_ChuanQi"], hall_layout:"A_ChuanQi_Res"},
        "style_GongDou" :    { id: 11, bUseGameRole:false, name: "宫   斗", bgm:"sound",  dec:"style_GongDou" ,icon:["style_GongDou"]},
        "style_QMoHuan" :    { id: 13, bUseGameRole:false, name: "Q版魔幻", bgm:"sound", dec:"style_TongYong", icon:["style_QMoHuan"]},
        "style_QSanGuo" :    { id: 12, bUseGameRole:false, name: "Q版三国", bgm:"sound", dec:"style_TongYong", icon:["style_JJSanGuo"]},
        "style_JJSanGuo":    { id:  1, bUseGameRole:false, name: "街机三国", bgm:"sound", dec:"style_TongYong", icon:["style_JJSanGuo"]},
        "style_NiuNiu"  :    { id: 14, bUseGameRole:false, name: "牛   牛", bgm:"sound_QiPai", dec:"style_QiPai" ,   icon:["style_NiuNiu"]},
        "style_DiZhu"   :    { id: 14, bUseGameRole:false, name: "地   主", bgm:"sound_QiPai", dec:"style_QiPai" ,   icon:["style_DiZhu"]}, 
        "style_Fruit"   :    { id: 15, bUseGameRole:false, name: "水   果", bgm:"sound_QiPai",  dec:"style_QiPai" ,   icon:["style_Fruit"]}, 
        "style_Dice"    :    { id: 14, bUseGameRole:false, name: "骰   子", bgm:"sound_QiPai",  dec:"style_QiPai" ,   icon:["style_Dice"]}, 
        "style_LongHu"  :    { id: 14, bUseGameRole:false, name: "龙   虎", bgm:"sound_QiPai",  dec:"style_QiPai" ,   icon:["style_LongHu"]},
        "style_Mahjong" :    { id:  3, bUseGameRole:true , name: "麻   将", bgm:"sound_QiPai",  dec:"style_QiPai" ,   icon:["style_Mahjong", "style_TongYong"]},
        "style_PDK"     :    { id:  3, bUseGameRole:true , name: "跑 得 快", bgm:"sound_QiPai",  dec:"style_QiPai" ,  icon:["style_Poker", "style_TongYong"]}, 
        "style_Poker"   :    { id:  3, bUseGameRole:true , name: "扑   克",  bgm:"sound_QiPai",  dec:"style_QiPai" ,  icon:["style_Poker", "style_TongYong"],hall_layout:"A_Poker_Modren_Res"}, 
    },
    EXCLUDE_FILENAME_DS_STORE : ".DS_Store",
    GAME_RES_PATH   : "../Game/",
    ICON_ROLE_PATH  : "img/role_icon/role_icon.png",
    PROTO_ROLE_PATH : "img/role_proto/role_proto.png",
    GRABSCREEN_PATH : "grabscreen/",
    OUT_PATH : "./output",
    ARTS_PATH : "Arts",
    DEMO_PATH : "demo",
    ARCHIVE_DIR : "change",
    COMMON_RES  : "common_res",
    GIT_URL : function(name){
        var url = `http://52.221.61.54/iospack/game/${name}.git`
        return url
    },
    UseLayoutList:function (){
        var ignoreGameList = ["TigerJumpQXianXia", "CardCompareQXianXia","CalRunXianxia","CQ_TigerJump","CQ_CalRun","CQ_LongHuDou","CQ_LavaBeast","CQ_MobileDot","CQ_shilong","CQ_FourComparisons","CQ_FruitTurn"]
        let isExist = false
        ignoreGameList.forEach(element => {
            if (element == config.PACKAGE_GAME_NAME){
                isExist =  true
            }
        });
        return isExist
    },
    UsePokerLayoutList:function (){
        var ignoreGameList = ["Poke_14dian","Poke_jingji","Poker_jiyi","Poker_12dian","Poker_witch"]
        let isExist = false
        ignoreGameList.forEach(element => {
            if (element == config.PACKAGE_GAME_NAME){
                isExist =  true
            }
        });
        return isExist
    },
    isKeKeIgnoreListFunc: function(key){
        var ignoreGameList = ["KeKeDianWanCheng"]
        let isExist = false
        ignoreGameList.forEach(element => {
            if (element == config.PACKAGE_GAME_NAME){
                isExist =  true
            }
        });
        return isExist
    },
    getShareFile : function(key){
        var resShareMap = this.ShareResMap[key]
        var shareStyleMap = resShareMap.share
        var curStyle = config.PACKAGE_GAME_STYLE
        var isShareStyle = false
        for (i = 0 ;i<shareStyleMap.length;i++){
            var styles = shareStyleMap[i].styles
            for (j = 0;j<styles.length;j++){
                if (styles[j] == curStyle){
                    isShareStyle = true
                    curStyle = shareStyleMap[i].shareStyle
                    break
                }
            }
            if (isShareStyle == true){break}
        }

        //只有棋牌才有子风格
        var childStyle = ""
        if (curStyle == "style_QiPai"){
            childStyle = "Modern"
        }
        var splitChar = this.getSplitCharPath(resShareMap.name)
        return path.join(this.SHARE_DIR,key,splitChar,curStyle,childStyle)
    },
    getSplitCharPath : function(char){
        if (!char ) { return "" }
        var splitFunc = function(url){
            var site = url.lastIndexOf("\:");
            var sub = url.substring(site+1,url.length)
            if (sub.indexOf('|') != -1){
                var s = sub.split("|")
                if(ISL){
                    return s[0]
                } else{
                    return s[1]
                }
            }
        }
        if (char.indexOf(',') == -1){
            return splitFunc(char)
        }
        else{
            var eachCharArr = char.split(",");
            var arr = []
            eachCharArr.forEach((ele,idx) => {
               arr[idx] = splitFunc(ele)
            });
            return arr.join('/');
        }
    },
    isL:function(){
        var GameName = this.GAME_RES_PATH + config.PACKAGE_GAME_NAME
        let gameconfig_path = path.join(GameName,"demo","src","config.lua")
        if (fs.existsSync(gameconfig_path)){
            let str = fs.readFileSync(gameconfig_path, "utf8");
            var regExp = new RegExp("width\\s{0,}=\\s{0,}(\\d+),[\\s\\S]+height\\s{0,}=\\s{0,}(\\d+)","m");// ([\\s\\S]+?)height=\\s{0,}=\\s{0,}\\d+", "m");
            console.log(str.match(regExp));
            var size = str.match(regExp)
            if (parseInt(size[1]) > parseInt(size[2])){
                return true
            }
            else{
                return false
            }
        }else{
            throw "not find config.lua "
        }
    },
    MODE_TYPE1 : 1,
    MODE_TYPE2 : 2,
    MODE_TYPE3 : 3,
    SHARE_DIR: "../ShareRes",
    ShareResMap : {
        bg:{
            depth:1,
            name:"1:1280-720|720-1280",
            share:[
                {
                    styles:["style_NiuNiu","style_DiZhu","style_Fruit","style_Dice","style_LongHu","style_Mahjong","style_PDK","style_Poker"],
                    shareStyle:"style_QiPai"
                }
            ]
        },
        role:{
            share:[
                {
                    styles:["style_Fruit","style_Mahjong","style_PDK","style_Poker"],
                    shareStyle:"style_QiPai"
                }
            ]
        },
        btnGroup:{
            share:[
                {
                    styles:["style_NiuNiu","style_DiZhu","style_Fruit","style_Dice","style_LongHu","style_Mahjong","style_PDK","style_Poker"],
                    shareStyle:"style_QiPai"
                }
            ]
        },
        msgBox : {
            share:[
                {
                    styles:["style_NiuNiu","style_DiZhu","style_Fruit","style_Dice","style_LongHu","style_Mahjong","style_PDK","style_Poker"],
                    shareStyle:"style_QiPai"
                }
            ]
        }
    },
    LAYOUTCONFIG:{
        MODE_COMMON: "common",
        MODE_SPECIAL_PATH:"Special",
    }
}









