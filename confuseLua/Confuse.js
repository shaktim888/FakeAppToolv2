var path = require('path');
var fs = require('fs');
var random = require("string-random")
const { execSync } = require('child_process');
var ConfuseTool = require("./ConfuseTool");
let confuse_t = new ConfuseTool();
var ConfuseTool2 = require("./ConfuseTool2");
let confuse_t2 = new ConfuseTool2();
var Utils = require("../utils");
var utils = new Utils();
const config = require("../config")
var CUR_CNT = 0
const HYCodeScan = "../haoyue/tool/HYCodeScan.sh"

function confuseCodeAndRes(apppath, curOutdir, confuseconf, i, outdir){
    if (apppath.indexOf("H5") != -1){
        utils.JSObfuscator(curOutdir)
        var confuseDir = path.join(curOutdir,config.PACKAGE_GAME_NAME)
        encryptCode(confuseDir)
        
    }else{
        confuseFileNameAndFileStructure(apppath, curOutdir, confuseconf, i, outdir,true)
        confuseFileNameAndFileStructure(apppath, curOutdir, confuseconf, i, outdir,false)

        let encryptDir = path.join(curOutdir,"decrypt_src")
        encryptZip(apppath, encryptDir, confuseconf, i, outdir)
        addRubbishCodeAndRes(curOutdir)
    }
}

function encryptCode(outdir){
    console.log("加密")
    execSync(path.resolve(HYCodeScan) + " " + "--encrypt -i " + path.resolve(outdir) + " -o " + path.resolve(outdir,"../") + "/" + random(6) + "." + random(6))
}

function LuaObfuscator(outdir){
    console.log("混淆")
    execSync(path.resolve(HYCodeScan) + " " + "--luaobf -i " + path.resolve(outdir) )

}

//xxtea 
function XXTeaEncrypt(img_path){
    var ab_path = img_path
    if (img_path.indexOf("Users") == -1){
        ab_path = path.join(process.cwd(),img_path)
    }
    var files = fs.readdirSync(ab_path);
    if (files.length == 0){
        execSync("rm -rf " + ab_path)
    }
    files.forEach(
        function(file){
            var filepath = path.join(ab_path,file)
            var info = fs.statSync(filepath);
            if(info.isDirectory()){                 
                // 如果是文件夹遍历
                XXTeaEncrypt(filepath);
            }else{
                // 读出所有的文件
                if (path.extname(filepath) == ".lua"){              
                    execSync(path.resolve(HYCodeScan) + " --xxtea -k " + random(32) + " -s " + random(32) + " -i " + filepath + " -o " + filepath)
                }
            }               
        }
    );
}

//加密为类似.zip 文件并生成xxtea 垃圾文件
function encryptZip(apppath, curOutdir, confuseconf, i, outdir){
    //执行zip加密
    // if(fs.existsSync(curOutdir)){
    //     var files = fs.readdirSync(curOutdir)
    //     files.forEach((file, index) => {
    //         let curPath = path.join(curOutdir,file)
    //         if(file == "src" || file == "res"){
    //             var newPath = path.resolve(curOutdir,"code",file)
    //             utils.mkdirs(newPath)
    //             fs.renameSync(path.resolve(curPath),newPath)
    //         } 
    //     });
    // }
    // var codePath = path.join(curOutdir,"code")
    var codePath = curOutdir
    // utils.LuaObfuscator(codePath)
    encryptCode(codePath)
   
}

//增加垃圾文件xxtea
function addRubbishCodeAndRes(curOutdir){
    console.log("正在添加垃圾代码与资源")
    var ConfuseDir = path.join(curOutdir, random(8))
    confuse_t2.generateRandDir(curOutdir,"decrypt_src" ,ConfuseDir)
    XXTeaEncrypt(ConfuseDir)
    execSync(`${HYCodeScan} --mmd5 -i "${path.resolve(ConfuseDir)}"`)

}

//混淆资源目录与代码目录
function confuseFileNameAndFileStructure(apppath, curOutdir, confuseconf, i, outdir,isDecrypt){
    let apprespath = path.join(apppath, "res")
    let confusepath = confuseconf.confusepath
    var confuse_outpath
    if (confuseconf.type == "md5"){
        confuse_outpath = path.join(outdir, i.toString() + "_md5")
        confuse_t.confuseV1(path.join(curOutdir, "src"), path.join(confuse_outpath, "src"), "pkg",confuseconf.md5path)
        if (fs.existsSync(apprespath)){
            let confuse_outpathres = path.join(confuse_outpath, "res")
            if (!fs.existsSync(confuse_outpathres)){
                utils.mkdirs(confuse_outpathres);
            };
            this.copyFilesForExportApp(path.join(curOutdir, "res"), confuse_outpathres);
        }
    }else if(confuseconf.type == "vdir"){
        if (isDecrypt){
            confuse_outpath = path.join(outdir, i.toString() + "_decrypt")
        }else{
            confuse_outpath = path.join(outdir, i.toString() + "_virdir")
        }

        if (!confusepath){
            confusepath= "src/haoyue/"
        }
        confuse_t2.confuseV2new(curOutdir, confusepath, confuse_outpath, confuseconf.exportentry,null,isDecrypt)

    }else{
        if(fs.existsSync(curOutdir)){
            var files = fs.readdirSync(curOutdir)
            files.forEach((file, index) => {
                let curPath = path.join(curOutdir,file)
                if(file == "src" || file == "res"){
                    var newPath = path.resolve(curOutdir,"decrypt_src",file)
                    utils.mkdirs(newPath)
                    fs.renameSync(path.resolve(curPath),newPath)
                } 
            });
        }
    }
    let newPathName = "confuse_src"
    if (isDecrypt){
        newPathName = "decrypt_src"
    }
    if(fs.existsSync(confuse_outpath)){
        var newPath = path.join(curOutdir,newPathName)
        utils.mkdirs(newPath)
        fs.renameSync(confuse_outpath,newPath)

    }
    
}
module.exports = confuseCodeAndRes
  