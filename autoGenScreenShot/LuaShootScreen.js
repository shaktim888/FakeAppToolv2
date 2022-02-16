
var child_process = require('child_process')
var path = require('path')
var fs = require('fs')
var util = require('util')
var GrabScreenTool = function (wordir) {
    this.startGrabScreen = function (outpath,isL) {
        var gamedir = path.resolve(outpath)
        let configJson = "./runtime/mac/lua_src-desktop.app/Contents/Resources/config.json"
        let confdata = JSON.parse(fs.readFileSync(configJson));
        if(isL){
            confdata.init_cfg["width"] = 1280
            confdata.init_cfg["height"] = 720
        }else{
            confdata.init_cfg["width"] = 720
            confdata.init_cfg["height"] = 1280
        }
        confdata.init_cfg["isLandscape"]= isL
        fs.writeFileSync(configJson,JSON.stringify(confdata,null,2),{flag:"w"})
        var cmd = "./runtime/mac/lua_src-desktop.app/Contents/MacOS/lua_src-desktop -workdir %s "
        cmd = util.format(cmd, gamedir);
        console.log(cmd)
        child_process.execSync(cmd);

        renameHyeconf(outpath)

        var tardirname = path.join(gamedir, "grabscreen")
        if (!fs.existsSync(tardirname)) {
            fs.mkdirSync(tardirname)
        }
        var files = fs.readdirSync(gamedir);
        for (let index = 0; index < files.length; index++) {
            const element = files[index];
            if (path.extname(element) == ".png" && path.basename(element).slice(0, 11) == "grabscreen_") {
                console.log(path.basename(element))
                var srcpath = path.join(gamedir, path.basename(element))
                fs.copyFileSync(srcpath, path.join(tardirname, path.basename(element)))
                fs.unlinkSync(srcpath)
            }
        }
    }
}



function renameHyeconf(dir){
    var ab_path 
    if (path.isAbsolute(dir)){
        ab_path = dir
    }else{
        ab_path = path.join(process.cwd(),dir) 
    }
    var files = fs.readdirSync(ab_path)
    files.forEach((ele) =>{
        var filepath = path.join(ab_path,ele)
        if(fs.statSync(filepath).isDirectory()){                 
            renameHyeconf(filepath)
        }
        else{
            if (ele == "hyeconf"){
                var newPath = path.join(ab_path,"hyeconf__")
                fs.renameSync(filepath,newPath)
                return false
            }
        }       
    })
}
module.exports = GrabScreenTool;
