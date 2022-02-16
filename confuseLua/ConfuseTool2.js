
var path = require("path");
var fs = require('fs');
const crypto = require('crypto');
var util = require("util");
var tools = require("../utils")
const { execSync } = require("child_process")
var CET4words = require("./hylibraries/CET-4-words.js")
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

// function getMd5Str(content){
//     const str = content;
    
//     // 创建一个hash对象
//     var md5 = crypto.createHash('md5');
    
//     // 往hash对象中添加摘要内容
//     md5.update(str);
//     // 使用 digest 方法输出摘要内容，不使用编码格式的参数 其输出的是一个Buffer对象
//     // console.log(md5.digest()); 
//     // 输出 <Buffer 90 01 50 98 3c d2 4f b0 d6 96 3f 7d 28 e1 7f 72>

//     // 使用编码格式的参数，输出的是一个字符串格式的摘要内容
//     return md5.digest('hex')
// }

function getRandomNum(Min,Max){
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
}

let ConfuseTool2 = function () {
    this.changeDir = function(src, confusepath, exportentry){

        if (src.startsWith(confusepath + "res")) {
            src = src.replace(confusepath + "res/", "");
        }else{
            // 以后为了兼容其他目录  可能需要修改这里
            if (src.endsWith(".lua")){
                if (src.startsWith(confusepath)){
                    src = src.replace(confusepath, path.basename(confusepath) + "/");
                }else if(src.startsWith(path.basename(confusepath))){
                    src = src.replace(path.basename(confusepath), exportentry);
                }
            }
        }
        return src;
    }
    this.generateRandDir = function(srcpath, confusepath,outpath, exportfname, modifyentry){
        var targetfname = path.basename(confusepath);
        
        // srcpath = path.dirname(srcpath);

        var exportentry = exportfname;
        if (!exportentry){
            exportentry = targetfname
        }else if(exportentry == "random"){
            var abs_exportpath = this.getSubFilenameNotExistIn(outpath)
            exportentry = path.basename(abs_exportpath)
        }

        var outconfusepath = path.join(path.dirname(confusepath), exportentry)
        this.targetfname = targetfname
        // if (!this.targetfname){
        //     this.targetfname = "haoyue"
        // }

        this.srcpath = srcpath;// path.join(srcpath, this.targetfname)
        this.outpath = outpath
        let confuse_srcpath = path.join(srcpath, confusepath)
        this.confuse_srcpath = confuse_srcpath

        this.fileinfos = {};
        this.virdirs = undefined;
        // 以上重置成员变量
        
        // 统计需要混淆的文件    // 采集所有文件路径 相对根目录的路径
        this.collectFilesVirtualDir(confuse_srcpath);

        // 选择一个最深的目录作为索引文件目录  其他人不太容易找到。 方便使用工具的用户找到
        this.index_dir = undefined;
        // 递归构造虚拟目录
        // var vir_dir = path.join(outpath, outconfusepath)
        var vir_dir = outpath
        this.buildPath(vir_dir, 0);
        if (!this.index_dir){
            this.index_dir = vir_dir;
        }

        this.totaldircount = this.virdirs.size;

        let copycount = 0;
        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile];
            let filepath = path.join(this.srcpath, perfile);
            var count = getRandomNum(0, this.totaldircount - 1);
            var index = 0;
            for (var [key, val] of this.virdirs.entries()) {
                if (index == count){
                    // 文件名是否修改
                    let filename = path.basename(filepath);
                    if (false){
                        // console.log("val[0] = ",  val[0])
                        filename = this.getSubFilenameNotExistIn(val[0])
                        // console.log("filename = " + filename);
                        filename = path.basename(filename)
                    }

                    var abs_filename = path.join(val[0], filename)
                    // 这些文件 必须添加文件名后缀 否则在ios系统上可能无法正确识别文件类型,导致文件失效
                    // if (info[1] == ".mp3" || info[1] == ".wav" || info[1] == ".lua" || info[1] == ".png"){
                    //     abs_filename = abs_filename + info[1]
                    // };

                    fs.copyFileSync(filepath, abs_filename);

                    copycount = copycount + 1
                    // 相对路径名字
                    info[2] =  path.relative(outpath, abs_filename);
                    break;
                }
                index = index + 1;
            }
        }

        // 参数是绝对路径
        // console.log("this.index_dir = ", this.index_dir)
        let indexabs_fname = this.getSubFilenameNotExistIn(this.index_dir) //"z714254584456547a4b7c544a44565eEntry" 
        // let indexfname = path.basename(indexabs_fname)
        // 这是索引文件相对输出路径的相对路径
        let indexfname = path.relative(outpath, indexabs_fname);

        this.createIndexFileVirtualDir(outpath, confusepath, outconfusepath, indexfname);

        // 修改文件入口
        // 对应haoyue/main.lua文件 这里要换成混淆后的名字路径
        let finfo = this.fileinfos[path.join(confusepath, "main.lua")]
   
        execSync("rm -rf " + this.confuse_srcpath)
    } 


    // this.createIndexFileMD5 = function(srcpath, targetfname, indexfname){
    //     let huiche = "\n";
    //     let ret = "local info = {res = {}, c = {}, all = {}} " + huiche;
    //     ret = ret + "local t = info[\"all\"] " + huiche;
        
    //     let linemodel = "t[\"%s\"] = \"%s\"  "+ huiche;
    //     for (perfile in this.fileinfos){
    //         // console.log(perfile)
    //         let info = this.fileinfos[perfile]
    //         let tmppath = this.changeDir(perfile, targetfname);
    //         let line = util.format(linemodel,  tmppath, path.join("src", this.outFilename, info[0]));
    //         ret = ret + line;
    //     }

    //     ret = ret + "  ";
    //     ret = ret + huiche +
	// 	"if not __iWannadoSomeThing then  " + huiche + 
	// 	"	function __iWannadoSomeThing()  " + huiche +
	// 	"		cc.FileUtils:getInstance():setFilenameLookupDictionary(t)  " + huiche +
	// 	"	end  " + huiche +
	// 	" 	__iWannadoSomeThing() " + huiche +
	// 	"end " + huiche;
    //     ret = ret + "return info";

    //     fs.writeFileSync(path.join(srcpath, indexfname), ret);
    //     return ;
    // }

    this.collectFiles = function(srcpath){
        var files = fs.readdirSync(srcpath);  
        for(var i in files){
            let ele = files[i];
            if (ele != ".DS_Store" && ele != ".git" && ele != ".vscode" && ele != "hyeconf"){
                let temp = path.join(srcpath, ele)
                var f = fs.statSync(temp);
                if(f.isDirectory()){
                    this.collectFiles(temp);
                }else if (f.isFile()){
                    let md5str = getMd5Str(fs.readFileSync(temp));
                    let filesize = f.size;
                    if (path.extname(temp) == ".mp3"){
                        md5str = md5str + ".mp3"
                    }
                    if (path.extname(temp) == ".wav"){
                        md5str = md5str + ".wav"
                    }
                    if (path.extname(temp) == ".lua"){
                        md5str = md5str + ".lua"
                    }

                    let key = path.relative(this.srcpath, temp);
                    this.fileinfos[key] = [md5str, filesize];
                    // console.log(temp);
                    // console.log(key);
                }
            }
        };  
    }

    this.collectFilesVirtualDir = function(srcpath){
        var files = fs.readdirSync(srcpath);  
        for(var i in files){
            let ele = files[i];
            // console.log("collectFilesVirtualDir " + ele);
            if (ele != ".DS_Store" && ele != ".git" && ele != ".vscode" && ele != "hyeconf"){
                let temp = path.join(srcpath, ele)
                var f = fs.statSync(temp);
                if(f.isDirectory()){
                    this.collectFilesVirtualDir(temp);
                }else if (f.isFile()){
                    let key = path.relative(this.srcpath, temp);
                    // console.log("collectFilesVirtualDir key = " + key);
                    // 拷贝之前原绝对路径名字，扩展名字 (后面处理会添加输出之后的相对路径名字)
                    // key为原相对路径名字
                    this.fileinfos[key] = [temp, path.extname(ele)];
                }
            }
        };  
    }
    this.isExistIgoreList = function (item){
        let igorelist = [".DS_Store","img","描述.txt","grabscreen","Icon","firstRole.png","iconRole.png","ad_view"]
        let isExist = false
        igorelist.forEach(ele =>{
            if (ele == item){
                isExist = true
            }
        })
        return isExist
    }

    this.copyEnvironmentFiles = function(srcpath, destpath, excludepath){
        // console.log("copyEnvironmentFiles " + srcpath);
        let files = fs.readdirSync(srcpath)
        let tarabsfname = excludepath //path.join(this.srcpath, this.targetfname)
        if (tarabsfname.charAt(tarabsfname.length - 1) == path.sep){
            tarabsfname = tarabsfname.slice(0, -1)
        }
        for(var findex in files){
            let ele = files[findex];
            let temp = path.join(srcpath, ele)
            if (!this.isExistIgoreList(ele) && (temp != tarabsfname) ){
                if ((!this.isDecrypt && ele!= "decrypt_src") || this.isDecrypt){
                      // console.log(temp);
                    // console.log(tarabsfname);
                    var f = fs.statSync(temp);
                    if(f.isDirectory()){
                        var dest = path.join(destpath, ele)
                        if (!fs.existsSync(dest)){
                            mkdirs(dest);
                        }
                        this.copyEnvironmentFiles(temp, dest, excludepath);
                    }else if (f.isFile()){
                        var dest = path.join(destpath, ele)
                        fs.copyFileSync(temp, dest);
                    }
                }
              
            }
        }
    }

    // 带main.lua的路径  haoyue/main.lua的路径
    // index的文件名
    this.modifyGameEntry = function(entry_path, filename, indexfname){
        let str = fs.readFileSync(entry_path, "utf8");
        // console.log(str);
        var regExp = new RegExp("local\\s+function\\s+main\\(\\)([\\s\\S]+?)end", "m");
        let entry_code = 'local tbl = {"src","' + this.outFilename +'","'+ filename +'"} load(cc.FileUtils:getInstance():getStringFromFile(table.concat(tbl, "/")))():create():run() '
        let main_func_code = 'local function main() %s end'
        main_func_code = util.format(main_func_code, entry_code);
        var newstr = str.replace(regExp, main_func_code);
        fs.writeFileSync(entry_path, newstr);

        let entry_code1 = 'local tbl = {"src","' + this.outFilename +'","'+indexfname+'"} load(cc.FileUtils:getInstance():getStringFromFile(table.concat(tbl, "/")))() '
        let f = path.join(this.outpath, this.outFilename, filename)
        let str1 = fs.readFileSync(f, "utf8");
        var regExp1 = new RegExp("setmetatable\\(_G,\\s+meta\\)", "m");
        var newstr1 = str1.replace(regExp1, 'setmetatable(_G, meta) ' + entry_code1);
        fs.writeFileSync(f, newstr1);
    }

    {
    // this.confuseV1 = function(srcpath, outpath, outFilename, targetfname){
    //     this.targetfname = targetfname
    //     if (!this.targetfname){
    //         this.targetfname = "haoyue"
    //     }
    //     this.outFilename = outFilename;
    //     if (!this.outFilename){
    //         this.outFilename = "pkg"
    //     }

    //     this.srcpath = srcpath;
    //     this.outpath = outpath

    //     let confuse_srcpath = path.join(srcpath, this.targetfname)
    //     this.confuse_srcpath = confuse_srcpath

    //     this.fileinfos = {};
    //     // 以上重置成员变量

    //     // 统计需要混淆的文件   // 采集所有文件路径 相对根目录的路径
    //     this.collectFiles(confuse_srcpath);

    //     //拷贝其他文件 保证haoyue/main.lua运行环境不发生变化
    //     checkpathexists(outpath);
    //     this.copyEnvironmentFiles(srcpath, outpath);
        
    //     let confuse_outpath = path.join(outpath, outFilename)
    //     checkpathexists(confuse_outpath);

    //     //指定入口文件
    //     let indexfname = "z714254584456547a4b7c544a44565eEntry" 
    //     // 创建索引文件
    //     this.createIndexFileMD5(confuse_outpath, this.targetfname, indexfname);
        
    //     // 拷贝所有文件 同时修改文件名
    //     for (perfile in this.fileinfos){
    //         let info = this.fileinfos[perfile]
    //         let filepath = path.join(this.srcpath, perfile)
    //         fs.copyFileSync(filepath, path.join(confuse_outpath, info[0]));
    //     }

    //     // 修改文件入口
    //     // 对应haoyue/main.lua文件 这里要换成md5后的名字
    //     let finfo = this.fileinfos[path.join(this.targetfname, "main.lua")]
    //     let filename = finfo[0]
    //     this.modifyGameEntry(path.join(outpath, "main.lua"), filename, indexfname);

    //     console.log("confuseV1 execute succeed!")
    // }

    // this.confuseV2 = function(srcpath, outpath, targetfname){
    //     this.targetfname = targetfname
    //     if (!this.targetfname){
    //         this.targetfname = "haoyue"
    //     }

    //     this.srcpath = srcpath;  
    //     this.outpath = outpath
    //     let confuse_srcpath = path.join(srcpath, this.targetfname)
    //     this.confuse_srcpath = confuse_srcpath

    //     this.fileinfos = {};
    //     this.virdirs = undefined;
    //     // 以上重置成员变量

    //     // 统计需要混淆的文件    // 采集所有文件路径 相对根目录的路径
    //     this.collectFilesVirtualDir(confuse_srcpath);

    //     //拷贝其他文件 保证haoyue/main.lua运行环境不发生变化
    //     checkpathexists(outpath);
    //     this.copyEnvironmentFiles(srcpath, outpath);
        
    //     // 选择一个最深的目录作为索引文件目录  其他人不太容易找到。 方便使用工具的用户找到
    //     this.index_dir = undefined;
    //     // 递归构造虚拟目录
    //     this.buildPath(outpath, 0);
    //     if (!this.index_dir){
    //         this.index_dir = outpath;
    //     }

    //     this.totaldircount = this.virdirs.size;

    //     let copycount = 0;
    //     for (perfile in this.fileinfos){
    //         let info = this.fileinfos[perfile];
    //         let filepath = path.join(this.srcpath, perfile);
    //         var count = getRandomNum(0, this.totaldircount - 1);
    //         var index = 0;
    //         for (var [key, val] of this.virdirs.entries()) {
    //             if (index == count){
    //                 // 文件名是否修改
    //                 let filename = path.basename(filepath);
    //                 if (true){
    //                     console.log("val[0] = ",  val[0])
    //                     filename = this.getSubFilenameNotExistIn(val[0])
    //                     filename = path.basename(filename)
    //                 }

    //                 var abs_filename = path.join(val[0], filename)
    //                 // 这些文件 必须添加文件名后缀 否则在ios系统上可能无法正确识别文件类型,导致文件失效
    //                 if (info[1] == ".mp3" || info[1] == ".wav"){
    //                     abs_filename = abs_filename + info[1]
    //                 };

    //                 fs.copyFileSync(filepath, abs_filename);
    //                 copycount = copycount + 1
    //                 // 相对路径名字
    //                 info[2] =  path.relative(outpath, abs_filename);
    //                 break;
    //             }
    //             index = index + 1;
    //         }
    //     }

    //     console.log("this.fileinfos === size = " + Object.keys(this.fileinfos).length.toString())
    //     console.log("copycount === copycount = " + copycount.toString())

    //     // 参数是绝对路径
    //     console.log("this.index_dir = ", this.index_dir)
    //     let indexabs_fname = this.getSubFilenameNotExistIn(this.index_dir) //"z714254584456547a4b7c544a44565eEntry" 
    //     // let indexfname = path.basename(indexabs_fname)

    //     // 这是索引文件相对输出路径的相对路径
    //     let indexfname = path.relative(outpath, indexabs_fname);

    //     // console.log("this.targetfname = "+ this.targetfname);
    //     // console.log("this.indexfname = "+ indexfname);
    //     this.createIndexFileVirtualDir(outpath, this.targetfname, this.targetfname, indexfname);
    //     // this.createIndexFileVirtualDir(outpath, this.targetfname, indexfname);

    //     // 修改文件入口
    //     // 对应haoyue/main.lua文件 这里要换成混淆后的名字路径
    //     let finfo = this.fileinfos[path.join(this.targetfname, "main.lua")]
    //     let filename = finfo[2]

    //     this.modifyGameEntryVirdir(path.join(outpath, "main.lua"), filename, indexfname);
    //     console.log("confuseV2 execute succeed!")
    // }
    }

    /*
        param1:  主游戏的main入口
        param2:  haoyue(或者其他混淆入口文件夹)的main入口
        param3:  索引文件名称
        param4:  导出之后的文件夹搜索路径添加
    */
    this.replaceConfuseGameEntry = function(filename, indexfname, exportentry){
        // if (!exportentry){
        //     exportentry = this.targetfname;
        // }

        // let str = fs.readFileSync(filepath, "utf8");
        // console.log(str);

        // var regExp = new RegExp("local\\s+function\\s+main\\(\\)([\\s\\S]+?)end", "m");

        // let entry_code1 = ' load(cc.FileUtils:getInstance():getStringFromFile(\"'+ indexfname + '\"))()  cc.FileUtils:getInstance():addSearchPath(\"'+exportentry +'\") '
        let entry_code1 = ' load(cc.FileUtils:getInstance():getStringFromFile(\"'+ indexfname + '\"))() '
        let f = path.join(this.outpath, filename)
        let str1 = fs.readFileSync(f, "utf8");
        var regExp1 = new RegExp("setmetatable\\(_G,\\s+meta\\)", "m");
        var newstr1 = str1.replace(regExp1, 'setmetatable(_G, meta) ' + entry_code1);
        fs.writeFileSync(f, newstr1);

        // local GAME_PREX = "haoyue"

        // 是否替换  入口
        // let entry_code = `local GAME_PREX = \"${exportentry}\"`
        // var regExp = new RegExp("local\\s{0,}GAME_PREX\\s{0,}=\\s{0,}\"\\w+\"", "m");
        // var newstr = newstr1.replace(regExp, entry_code);
        // fs.writeFileSync(f, newstr);



        // let entry_code = ' load(cc.FileUtils:getInstance():getStringFromFile( \"'+ filename + '\" ))():create():run() '
        // let main_func_code = 'local function main() %s end'
        // main_func_code = util.format(main_func_code, entry_code);
        // var newstr = str.replace(regExp, main_func_code);
        // fs.writeFileSync(entry_path, newstr);
    }

    // haoyue结尾  可以用basename 得到最后的名字  使用的demo
    // confusetool.confuseV2AppointTargetname("./root_demo/demo/src/FaFamj", "./root_demo/confuse_virdir/src/")
    // this.confuseV2AppointTargetname = function(srcpath, outpath, exportfname){
    
    /* 
        这种只针对有haoyue文件夹这种情形
        param1: 代码的根路径  包括 src 和 res 的路径
        param2: 混淆代码相对路径如 src/haoyue
        param3: 导出路径, ./output/1
        param4: 导出文件夹名字 random or haoyue or 随机的
        param5: 无
    */
    this.confuseV2new = function(srcpath, confusepath, outpath, exportfname, modifyentry,isDecrypt){
        var targetfname = path.basename(confusepath);
        this.isDecrypt = isDecrypt
        // srcpath = path.dirname(srcpath);

        var exportentry = exportfname;
        if (!exportentry){
            exportentry = targetfname
        }else if(exportentry == "random"){
            var abs_exportpath = this.getSubFilenameNotExistIn(outpath)
            exportentry = path.basename(abs_exportpath)
        }

        var outconfusepath = path.join(path.dirname(confusepath), exportentry)
        this.targetfname = targetfname
        // if (!this.targetfname){
        //     this.targetfname = "haoyue"
        // }

        this.srcpath = srcpath;// path.join(srcpath, this.targetfname)
        this.outpath = outpath
        let confuse_srcpath = path.join(srcpath, confusepath)
        this.confuse_srcpath = confuse_srcpath

        this.fileinfos = {};
        this.virdirs = undefined;
        // 以上重置成员变量
        
        // 统计需要混淆的文件    // 采集所有文件路径 相对根目录的路径
        this.collectFilesVirtualDir(confuse_srcpath);

        //拷贝其他文件 保证haoyue/main.lua运行环境不发生变化
        checkpathexists(outpath);
        this.copyEnvironmentFiles(this.srcpath, outpath, confuse_srcpath);
        
        // 选择一个最深的目录作为索引文件目录  其他人不太容易找到。 方便使用工具的用户找到
        this.index_dir = undefined;
        // 递归构造虚拟目录
        var vir_dir = path.join(outpath, outconfusepath)
        this.buildPath(vir_dir, 0);
        if (!this.index_dir){
            this.index_dir = vir_dir;
        }

        this.totaldircount = this.virdirs.size;

        let copycount = 0;
        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile];
            let filepath = path.join(this.srcpath, perfile);
            var count = getRandomNum(0, this.totaldircount - 1);
            var index = 0;
            for (var [key, val] of this.virdirs.entries()) {
                if (index == count){
                    // 文件名是否修改
                    let filename = path.basename(filepath);
                    if (true){
                        // console.log("val[0] = ",  val[0])
                        filename = this.getSubFilenameNotExistIn(val[0])
                        // console.log("filename = " + filename);
                        filename = path.basename(filename)
                    }

                    var abs_filename = path.join(val[0], filename)
                    // 这些文件 必须添加文件名后缀 否则在ios系统上可能无法正确识别文件类型,导致文件失效
                    if (info[1] == ".mp3" || info[1] == ".wav"){
                        abs_filename = abs_filename + info[1]
                    };

                    if (info[1] == ".lua"){
                        abs_filename = abs_filename + info[1]
                    };

                    fs.copyFileSync(filepath, abs_filename);

                    copycount = copycount + 1
                    // 相对路径名字
                    info[2] =  path.relative(outpath, abs_filename);
                    break;
                }
                index = index + 1;
            }
        }

        //对Plist（如a.Plist,a.png)须成组出现的，将他们分在同一个文件夹之下
        this.plistGroupToTheSameDir()

        // 参数是绝对路径
        // console.log("this.index_dir = ", this.index_dir)
        let indexabs_fname = this.getSubFilenameNotExistIn(this.index_dir) //"z714254584456547a4b7c544a44565eEntry" 
        // let indexfname = path.basename(indexabs_fname)
        // 这是索引文件相对输出路径的相对路径
        let indexfname = path.relative(outpath, indexabs_fname);

        this.createIndexFileVirtualDir(outpath, confusepath, outconfusepath, indexfname);

        // 修改文件入口
        // 对应haoyue/main.lua文件 这里要换成混淆后的名字路径
        let finfo = this.fileinfos[path.join(confusepath, "main.lua")]
        // console.log(finfo)
        // console.log(path.join(confusepath, "main.lua"))
        let filename = finfo[2]
        // this.modifyGameEntryVirdir(path.join(outpath, "main.lua"), filename, indexfname);
        // 默认 游戏入口在 混淆代码文件夹的父文件夹下的main.lua中
        this.replaceConfuseGameEntry(filename, indexfname, exportentry);
        var parent_outconfusepath = path.join(outpath, path.dirname(outconfusepath))
        var outentryfname = path.join(parent_outconfusepath, "main.lua")
        if (modifyentry){
            let str = fs.readFileSync(outentryfname, "utf8");
            var regExp = new RegExp("local\\s+function\\s+main\\(\\)([\\s\\S]+?)end", "m");
            
            let entry_code = ' load(cc.FileUtils:getInstance():getStringFromFile( \"'+ filename + '\" ))() '
            let main_func_code = 'local function main() %s end'
            main_func_code = util.format(main_func_code, entry_code);
            var newstr = str.replace(regExp, main_func_code);
            fs.writeFileSync(outentryfname, newstr);
        } else {
            let replaceFile = function(filePath,sourceRegx,targetStr){
                fs.readFile(filePath,function(err,data){
                    if(err){
                        return err;
                    }
                    let str = data.toString();
                    str = str.replace(sourceRegx,targetStr);
                    fs.writeFile(filePath, str, function (err) {
                        if (err) return err;
                    });
                });
            }
            //遍历statics文件夹，找到main_*.js
            let gameentry = ' load(cc.FileUtils:getInstance():getStringFromFile( \"'+ filename + '\" ))()\n'
            // replaceFile(outentryfname,/require\(\"haoyue.main"\)/g,gameentry);
            if (this.isDecrypt) {
                let data = fs.readFileSync(outentryfname, "utf8")
                let lines = data.split('\n'); 
                lines.forEach((ele,index) =>{
                    if (ele.indexOf(".main") != -1) {
                       lines[index] = gameentry
                    }
                })
                let splited = lines.join('\n'); // joined it from the lines array 
                fs.writeFileSync(outentryfname, splited, {flag : 'w'});
            }else{
                fs.writeFileSync(path.join(parent_outconfusepath, "游戏入口代码.lua"), gameentry, {flag : 'w'});
            }
        }
        //执行混淆工具
        // let tool  = new tools()
        // tool.LuaObfuscator(parent_outconfusepath)
    } 

    this.plistGroupToTheSameDir = function(){
        let plistFiles = []
        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile]
            if (info[1] == ".plist") {
                plistFiles.push(info)
            }
        }
        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile]
            plistFiles.forEach((ele,index) =>{
                console.log(path.basename(ele[0],"plist"))
                console.log(path.basename(info[0],"png"))
                if (path.basename(ele[0],".plist") == path.basename(info[0],".png") && info[1] != ".plist") {
                    //将同名Png移动到Plist同一目录下，并将索引表进行修改
                    let srcpath = path.resolve(path.join(this.outpath,info[2]))
                    let destpath = path.resolve(this.outpath,ele[2] + ".png")
                    fs.copyFileSync(srcpath,destpath);   
                    info[2] = ele[2] + ".png"
                }
            })
        }
    }

    // 每个文件夹最多7个子文件夹
    // 深度最多3层
    this.buildPath = function(filepath, deep){
        if (!this.virdirs){
            this.virdirs = new Map();
        }
        // 当前有多少目录
        var count_obj = this.virdirs.get(filepath);
        var count = 0;

        checkpathexists(filepath);
        var files = fs.readdirSync(filepath);
        if (!count_obj){
            // 子文件夹 个数 
            count = getRandomNum(4, 7)
            this.virdirs.set(filepath, [filepath, count]);
        }else{
            count = count_obj[1];
        }

        if (deep == 3){
            if(!this.index_dir){
                this.index_dir = filepath;
            }
            // 最大深度
            return ;
        }

        var dircount = 0;
        for(var findex in files){
            var finfo = files[findex];
            var tmp = fs.statSync(path.join(filepath, finfo))
            if (tmp.isDirectory()){
                dircount = dircount + 1;
                // this.buildPath(abs_dirname, deep + 1);
            }
        }

        if (dircount > count){
            for(var findex in files){
                var finfo = files[findex];
                var abs_dirname = path.join(filepath, finfo);
                var tmp = fs.statSync(abs_dirname)
                if (tmp.isDirectory()){
                    this.buildPath(abs_dirname, deep + 1);
                }
            }
        }else{
            for(var j = dircount + 1; j<=count;j++){
                var abs_dirname = this.getSubFilenameNotExistIn(filepath)
                this.buildPath(abs_dirname, deep + 1);
            }
        }
    }

    this.createIndexFileVirtualDir = function(outpath, confusepath, exportentry, indexfname){
        // var export_entry = exportentry
        // if (!export_entry){
        //     export_entry = targetfname
        // }
        let huiche = "\n";
        let ret = "local info = {res = {}, c = {}, all = {}} " + huiche;
        ret = ret + "local t = info[\"all\"] " + huiche;

        let writePath = ""

        if (this.isDecrypt ){
            writePath = "cc.FileUtils:getInstance():getWritablePath()..\"qwert1/\".."
        }

        let linemodel = "t[\"%s\"] = %s\"%s\"  "+ huiche; //util.format( + path.resove(prefix, outpath, ), );

        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile]
            let srctmppath = this.changeDir(perfile, confusepath, exportentry);

            // let tpath = path.join("src", info[2])

            let line = util.format(linemodel, srctmppath, writePath, info[2]); //this.outFilename, info[0]));
            ret = ret + line;
        }

        ret = ret + "  ";

        ret = ret + huiche +
		"if not __iWannadoSomeThing then  " + huiche + 
		"	function __iWannadoSomeThing()  " + huiche +
		"		cc.FileUtils:getInstance():setFilenameLookupDictionary(t)  " + huiche +
		"	end  " + huiche +
		" 	__iWannadoSomeThing() " + huiche +
		"end " + huiche;
        ret = ret + "return info";

        
        fs.writeFileSync(path.join(outpath, indexfname), ret, {flag : 'w'});
        return ;
    }

        // 带main.lua的路径
    // index的文件名
    this.modifyGameEntryVirdir = function(entry_path, filename, indexfname){
        let str = fs.readFileSync(entry_path, "utf8");
        // console.log(str);

        var regExp = new RegExp("local\\s+function\\s+main\\(\\)([\\s\\S]+?)end", "m");

        let entry_code = ' load(cc.FileUtils:getInstance():getStringFromFile( \"'+ filename + '\" ))():create():run() '
        let main_func_code = 'local function main() %s end'
        main_func_code = util.format(main_func_code, entry_code);
        var newstr = str.replace(regExp, main_func_code);
        fs.writeFileSync(entry_path, newstr);

        let entry_code1 = ' load(cc.FileUtils:getInstance():getStringFromFile(\"'+ indexfname + '\"))() '
        let f = path.join(this.outpath, filename)
        let str1 = fs.readFileSync(f, "utf8");
        var regExp1 = new RegExp("setmetatable\\(_G,\\s+meta\\)", "m");
        var newstr1 = str1.replace(regExp1, 'setmetatable(_G, meta) ' + entry_code1);
        fs.writeFileSync(f, newstr1);
    }

    this.getRandFileName = function(){   
        let index = getRandomNum(0, cet_4_words.length - 1);
        return cet_4_words[index];
    }

    this.getSubFilenameNotExistIn = function(destpath){
        var tmp_dirname // = getRandFileName();
        var abs_dirname 
        do {
            tmp_dirname = this.getRandFileName();
            // console.log("tmp_dirname = " + tmp_dirname);
            // console.log("destpath = " + destpath);
            abs_dirname = path.join(destpath, tmp_dirname);
            if (!fs.existsSync(abs_dirname)){
                return abs_dirname;
            }
        }
        while(true);
        return ;
    }
}

module.exports = ConfuseTool2;