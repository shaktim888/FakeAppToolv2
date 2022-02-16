
var path = require("path");
var fs = require('fs');

const crypto = require('crypto');
var util = require("util");

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

function getMd5Str(content){
    const str = content;
    
    // 创建一个hash对象
    var md5 = crypto.createHash('md5');
    
    // 往hash对象中添加摘要内容
    md5.update(str);
    // 使用 digest 方法输出摘要内容，不使用编码格式的参数 其输出的是一个Buffer对象
    // console.log(md5.digest()); 
    // 输出 <Buffer 90 01 50 98 3c d2 4f b0 d6 96 3f 7d 28 e1 7f 72>

    // 使用编码格式的参数，输出的是一个字符串格式的摘要内容
    return md5.digest('hex')
}

function getRandomNum(Min,Max){
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
}

let ConfuseTool = function () {
    this.changeDir = function(src, targetfname, exportentry){

        if (src.startsWith(targetfname + "/res")) {
            src = src.replace(targetfname + "/res/", "");
        }else{
            // 以后为了兼容其他目录  可能需要修改这里
            if (src.endsWith(".lua")){
                // if (src.startsWith(targetfname + "/")){
                //     src = src.replace(targetfname + "/", targetfname + "/");
                // }
            }
        }
        return src;
    }

    this.createIndexFileMD5 = function(srcpath, targetfname, indexfname){
        let huiche = "\n";
        let ret = "local info = {res = {}, c = {}, all = {}} " + huiche;
        ret = ret + "local t = info[\"all\"] " + huiche;
        
        let linemodel = "t[\"%s\"] = \"%s\"  "+ huiche;
        for (perfile in this.fileinfos){
            // console.log(perfile)
            let info = this.fileinfos[perfile]
            let tmppath = this.changeDir(perfile, targetfname);
            let line = util.format(linemodel,  tmppath, path.join("src", this.outFilename, info[0]));
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

        fs.writeFileSync(path.join(srcpath, indexfname), ret);
        return ;
    }

    this.collectFiles = function(srcpath){
        var files = fs.readdirSync(srcpath);  
        for(var i in files){
            let ele = files[i];
            if (path.basename(ele) != ".DS_Store" && path.basename(ele) != ".git" && path.basename(ele) != ".vscode"){
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
            if (path.basename(ele) != ".DS_Store" && path.basename(ele) != ".git" && path.basename(ele) != ".vscode" && path.basename(ele) != "hyeconf"){
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

    this.copyEnvironmentFiles = function(srcpath, destpath){
        let files = fs.readdirSync(srcpath)
        let tarabsfname = path.join(this.srcpath, this.targetfname)
        for(var findex in files){
            let ele = files[findex];
            let temp = path.join(srcpath, ele)
            if (path.basename(ele) != ".DS_Store" && (temp != tarabsfname)){
                var f = fs.statSync(temp);
                if(f.isDirectory()){
                    var dest = path.join(destpath, ele)
                    if (!fs.existsSync(dest)){
                        mkdirs(dest);
                    }
                    this.copyEnvironmentFiles(temp, dest);
                }else if (f.isFile()){
                    var dest = path.join(destpath, ele)
                    fs.copyFileSync(temp, dest);
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

    this.confuseV1 = function(srcpath, outpath, outFilename, targetfname){
        this.targetfname = targetfname
        if (!this.targetfname){
            this.targetfname = "haoyue"
        }
        this.outFilename = outFilename;
        if (!this.outFilename){
            this.outFilename = "pkg"
        }

        this.srcpath = srcpath;
        this.outpath = outpath

        let confuse_srcpath = path.join(srcpath, this.targetfname)
        this.confuse_srcpath = confuse_srcpath

        this.fileinfos = {};
        // 以上重置成员变量

        // 统计需要混淆的文件   // 采集所有文件路径 相对根目录的路径
        this.collectFiles(confuse_srcpath);

        //拷贝其他文件 保证haoyue/main.lua运行环境不发生变化
        checkpathexists(outpath);
        this.copyEnvironmentFiles(srcpath, outpath);
        
        let confuse_outpath = path.join(outpath, outFilename)
        checkpathexists(confuse_outpath);

        //指定入口文件
        let indexfname = "z714254584456547a4b7c544a44565eEntry" 
        // 创建索引文件
        this.createIndexFileMD5(confuse_outpath, this.targetfname, indexfname);
        
        // 拷贝所有文件 同时修改文件名
        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile]
            let filepath = path.join(this.srcpath, perfile)
            fs.copyFileSync(filepath, path.join(confuse_outpath, info[0]));
        }

        // 修改文件入口
        // 对应haoyue/main.lua文件 这里要换成md5后的名字
        let finfo = this.fileinfos[path.join(this.targetfname, "main.lua")]
        let filename = finfo[0]
        this.modifyGameEntry(path.join(outpath, "main.lua"), filename, indexfname);

        console.log("confuseV1 execute succeed!")
    }

    this.confuseV2 = function(srcpath, outpath, targetfname){
        this.targetfname = targetfname
        if (!this.targetfname){
            this.targetfname = "haoyue"
        }

        this.srcpath = srcpath;  
        this.outpath = outpath
        let confuse_srcpath = path.join(srcpath, this.targetfname)
        this.confuse_srcpath = confuse_srcpath

        this.fileinfos = {};
        this.virdirs = undefined;
        // 以上重置成员变量

        // 统计需要混淆的文件    // 采集所有文件路径 相对根目录的路径
        this.collectFilesVirtualDir(confuse_srcpath);

        //拷贝其他文件 保证haoyue/main.lua运行环境不发生变化
        checkpathexists(outpath);
        this.copyEnvironmentFiles(srcpath, outpath);
        
        // 选择一个最深的目录作为索引文件目录  其他人不太容易找到。 方便使用工具的用户找到
        this.index_dir = undefined;
        // 递归构造虚拟目录
        this.buildPath(outpath, 0);
        if (!this.index_dir){
            this.index_dir = outpath;
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
                        filename = path.basename(filename)
                    }

                    var abs_filename = path.join(val[0], filename)
                    // 这些文件 必须添加文件名后缀 否则在ios系统上可能无法正确识别文件类型,导致文件失效
                    if (info[1] == ".mp3" || info[1] == ".wav"){
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

        // console.log("this.fileinfos === size = " + Object.keys(this.fileinfos).length.toString())
        // console.log("copycount === copycount = " + copycount.toString())

        // 参数是绝对路径
        // console.log("this.index_dir = ", this.index_dir)
        let indexabs_fname = this.getSubFilenameNotExistIn(this.index_dir) //"z714254584456547a4b7c544a44565eEntry" 
        // let indexfname = path.basename(indexabs_fname)

        // 这是索引文件相对输出路径的相对路径
        let indexfname = path.relative(outpath, indexabs_fname);

        // console.log("this.targetfname = "+ this.targetfname);
        // console.log("this.indexfname = "+ indexfname);
        this.createIndexFileVirtualDir(outpath, this.targetfname, this.targetfname, indexfname);
        // this.createIndexFileVirtualDir(outpath, this.targetfname, indexfname);

        // 修改文件入口
        // 对应haoyue/main.lua文件 这里要换成混淆后的名字路径
        let finfo = this.fileinfos[path.join(this.targetfname, "main.lua")]
        let filename = finfo[2]

        this.modifyGameEntryVirdir(path.join(outpath, "main.lua"), filename, indexfname);
        console.log("confuseV2 execute succeed!")
    }

    this.replaceGameEntry = function(filepath, filename, indexfname, exportentry){
        if (!exportentry){
            exportentry = this.targetfname;
        }

        let str = fs.readFileSync(filepath, "utf8");
        // console.log(str);

        var regExp = new RegExp("local\\s+function\\s+main\\(\\)([\\s\\S]+?)end", "m");

        let entry_code1 = 'load(cc.FileUtils:getInstance():getStringFromFile(\"src/'+ indexfname + '\"))() '
        let f = path.join(this.outpath, filename)
        let str1 = fs.readFileSync(f, "utf8");
        var regExp1 = new RegExp("setmetatable\\(_G,\\s+meta\\)", "m");
        var newstr1 = str1.replace(regExp1, 'setmetatable(_G, meta) ' + entry_code1);
        // fs.writeFileSync(f, newstr1);

        // local GAME_PREX = "haoyue"

        let entry_code = `local GAME_PREX = \"${exportentry}\"`
        var regExp = new RegExp("local\\s{0,}GAME_PREX\\s{0,}=\\s{0,}\"\\w+\"", "m");
        var newstr = newstr1.replace(regExp, entry_code);
        fs.writeFileSync(f, newstr);
        // let entry_code = this.getEntryCodeVirdir(filename); //' load(cc.FileUtils:getInstance():getStringFromFile( \"src/'+ filename + '\" ))():create():run() '
        // let main_func_code = 'local function main() %s end'
        // main_func_code = util.format(main_func_code, entry_code);
        // var newstr = str.replace(regExp, main_func_code);
        // fs.writeFileSync(entry_path, newstr);
    }

    // haoyue结尾  可以用basename 得到最后的名字  使用的demo
    // confusetool.confuseV2AppointTargetname("./root_demo/demo/src/FaFamj", "./root_demo/confuse_virdir/src/")
    this.confuseV2AppointTargetname = function(srcpath, outpath, exportfname){
        var targetfname = path.basename(srcpath);
        srcpath = path.dirname(srcpath);

        var exportentry = exportfname;
        if (!exportentry){
            exportentry = targetfname
        }else if(exportentry == "random"){
            var abs_exportpath = this.getSubFilenameNotExistIn(outpath)
            exportentry = path.basename(abs_exportpath)
        }

        this.targetfname = targetfname
        if (!this.targetfname){
            this.targetfname = "haoyue"
        }

        this.srcpath = srcpath; //path.join(srcpath, this.targetfname)
        this.outpath = outpath
        let confuse_srcpath = path.join(srcpath, this.targetfname)
        this.confuse_srcpath = confuse_srcpath

        this.fileinfos = {};
        this.virdirs = undefined;
        // 以上重置成员变量

        // 统计需要混淆的文件    // 采集所有文件路径 相对根目录的路径
        this.collectFilesVirtualDir(confuse_srcpath);

        //拷贝其他文件 保证haoyue/main.lua运行环境不发生变化
        checkpathexists(outpath);
        this.copyEnvironmentFiles(srcpath, outpath);
        
        // 选择一个最深的目录作为索引文件目录  其他人不太容易找到。 方便使用工具的用户找到
        this.index_dir = undefined;
        // 递归构造虚拟目录
        var vir_dir = path.join(outpath, exportentry)
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

                    // console.log(val[0], filename);
                    // console.log(filepath, abs_filename);
                    fs.copyFileSync(filepath, abs_filename);

                    copycount = copycount + 1
                    // 相对路径名字
                    info[2] =  path.relative(outpath, abs_filename);
                    break;
                }
                index = index + 1;
            }
        }

        // console.log("this.fileinfos === size = " + Object.keys(this.fileinfos).length.toString())
        // console.log("copycount === copycount = " + copycount.toString())

        // 参数是绝对路径
        // console.log("this.index_dir = ", this.index_dir)
        let indexabs_fname = this.getSubFilenameNotExistIn(this.index_dir) //"z714254584456547a4b7c544a44565eEntry" 
        // let indexfname = path.basename(indexabs_fname)

        // 这是索引文件相对输出路径的相对路径
        let indexfname = path.relative(outpath, indexabs_fname);

        // console.log("this.targetfname = "+ this.targetfname);
        // console.log("this.indexfname = "+ indexfname);
        this.createIndexFileVirtualDir(outpath, this.targetfname, exportentry, indexfname);

        // 修改文件入口
        // 对应haoyue/main.lua文件 这里要换成混淆后的名字路径
        let finfo = this.fileinfos[path.join(this.targetfname, "main.lua")]
        // console.log(finfo)
        // console.log(path.join(this.targetfname, "main.lua"))
        let filename = finfo[2]

        // this.modifyGameEntryVirdir(path.join(outpath, "main.lua"), filename, indexfname);

        this.replaceGameEntry(path.join(outpath, "main.lua"), filename, indexfname);
        
        let gameentry = 'load(cc.FileUtils:getInstance():getStringFromFile( \"src/'+ filename + '\" ))()'
        fs.writeFileSync(path.join(path.dirname(outpath), "游戏入口代码.lua"), gameentry, {flag : 'w'});
        console.log("confuseV2 execute succeed!")
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

    this.createIndexFileVirtualDir = function(outpath, targetfname, exportentry, indexfname){
        var export_entry = exportentry
        if (!export_entry){
            export_entry = targetfname
        }
        let huiche = "\n";
        let ret = "local info = {res = {}, c = {}, all = {}} " + huiche;
        ret = ret + "local t = info[\"all\"] " + huiche;
        
        let linemodel = "t[\"%s\"] = \"%s\"  "+ huiche; //util.format( + path.resove(prefix, outpath, ), );

        for (perfile in this.fileinfos){
            let info = this.fileinfos[perfile]
            let srctmppath = this.changeDir(perfile, targetfname, export_entry);

            let tpath = path.join("src", info[2])
            let line = util.format(linemodel,  srctmppath, tpath); //this.outFilename, info[0]));
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
        let index = getRandomNum(0, cet_4_words.length);
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

module.exports = ConfuseTool;