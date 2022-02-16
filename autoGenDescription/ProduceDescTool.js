

var path = require("path");
var fs = require('fs');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

var descPath = "../autoGenDescription/allGameDesc/"
const define = require("../define")

let mkdirs = function(filepath){
    fs.mkdirSync(filepath, { recursive: true }, (err) => {
        if (err) throw err;
    });
};

function checkpathexists(filepath){
     if (!fs.existsSync(filepath)){
        mkdirs(filepath);
    };
}

function getRandomNum(Min,Max){
    var Range = Max - Min;   
    var Rand = Math.random();  
    return(Min + Math.round(Rand * Range));   
}

function readFileList(filesPath) {
    var count =  0;
    var files = fs.readdirSync(filesPath);
    for(var i in files){
        if (path.basename(files[i]) != ".DS_Store"){
            count = count + 1
        }
    }
    return count
}
function CopyDirectory(src,dest) {
    var dirs = fs.readdirSync(src);
    dirs.forEach(function(item){
        var item_path = path.join(src, item);
        var temp = fs.statSync(item_path);
        if (temp.isFile()) {
            fs.copyFileSync(item_path, path.join(dest, item));
        } 
    });
    console.log("完成拷贝" )  
}

let  ProduceDescTool = function (params) {
    this.writeDesc = function(writePath,otherconf){
        var style = otherconf.style
        var gametype = define.GAME_STYLE_TABLE[style].dec
        var filepath = path.join("./autoGenDescription/allGameDesc/",gametype)
        var filesList = [];
        var fileNum = readFileList(filepath,filesList);
        var count = getRandomNum(1,fileNum);   
        console.log("模版随机数：" + count)  
        var temp = path.join(gametype+"/",count + "/")
        var srcpath = path.join("./autoGenDescription/allGameDesc/",temp)

        var decpath = path.join("./autoGenDescription/","map.json")
        var confData = JSON.parse(fs.readFileSync(decpath));
        if(confData[otherconf.appName]){
            filepath = path.join("./autoGenDescription/allGameDesc/",confData[otherconf.appName])
            var tmp =path.join(filepath,"/")
            srcpath = path.join(tmp,count+ "/")
        }
        
        console.log("模版路径：" + srcpath)  
        CopyDirectory(srcpath,"./autoGenDescription")
        // 简单模式   词组替换

        const pkgPath = "./GameDescModelSimple.js"
        delete require.cache[require.resolve(pkgPath)]
        let projectPkg = require(pkgPath)

        const pkgPath2 = "./DescWordsSimple.js"
        delete require.cache[require.resolve(pkgPath2)]
        let projectPkg2 = require(pkgPath2)

        // var gamedesc = fs.readFileSync("./autoGenDescription/GameDescModelSimple.js")
        // var descword = fs.readFileSync("./autoGenDescription/DescWordsSimple.js")
        let str = this.toolSimpleMode();
        let filename = "描述.txt";
        checkpathexists(writePath);
        let pathname = path.join(writePath, filename);
        fs.writeFileSync(pathname, str);
    }

    this.toolSimpleMode = function(){

        var keys = Object.keys(desc_model_simple);
        var passage_model_size = keys.length;
        var index = getRandomNum(0, passage_model_size - 1);
        var passage_model_key = keys[index];
        var passage_model = desc_model_simple[passage_model_key];
        passage_model = passage_model.replace('/\n/g', "\n");
        var passage = this.fillSentence(passage_model,descwordsimple);
        return passage;
    }

    this.fillSentence = function(str, data_words){
        var reg =/<[\w\u4E00-\u9FA5\uF900-\uFA2D]+>/g;
        var ret = str.match(reg);
        if (!ret){
            return str;
        }
        let words = data_words
        if (!words){
            words = descwords;
        }
        for (var i = 0;i< ret.length; i++) {
            var key = ret[i];
            let k = key.slice(1,-1)
            let word = words[k];
            
            if (word){
                var index = getRandomNum(0, word.length - 1);
                var retword = word[index];
                // word_map[key] = retword;
                if (retword){
                    str = str.replace(key, retword)
                }
            }
        }
        return str;
    }
}

module.exports = ProduceDescTool