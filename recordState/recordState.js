/*
*文件存储状态记录（使用次数·上次使用时间）
*/

var fs = require('fs');
var path = require("path");
const crypto = require('crypto');
const ignore = require('ignore');
const low = require('lowdb');
var { execSync } = require('child_process');
const FileSync = require('lowdb/adapters/FileSync');
var Utils = require("../utils");
var utils = new Utils()
var define = require("../define")



const EXCLUDE_FILENAME_DS_STORE = ".DS_Store"
const EXCLUDE_FILENAME_RES_STATE_DIR = ".DB_State"
const TIME_DIFFERENCE = 7 //重置时间限制（天）
const EACH_RESOURCE_AVAILABLE_TIMES = 2 //每个资源有效次数
const GIT_STATE_PATH = "../Res_State/"
var minCount = undefined
var db = undefined

//获取最小count
function preCheck(moduledata,dirname){
    for (var ele in moduledata) {
        var subpath = path.join(dirname, ele)
        if (!fs.existsSync(subpath)){
            subpath = define.getShareFile(ele)
        }
        archive(subpath,true)
        setMinCanUseCount()
        //预检查总仓库
        // data.component = ele
        // checkGitState(data)
    }
    return minCount
}

function archive(dirname,isPreCheck){
    let archiveDir = path.join(dirname,EXCLUDE_FILENAME_RES_STATE_DIR)
    if (!fs.existsSync(archiveDir)){
        utils.mkdirs(archiveDir)
    }
    let adapter = new FileSync(path.join(archiveDir,'db.json'))
    db = low(adapter);
    let t = db.getState()
    if(! t.canUseCount){
        db.defaults({resState:[], canUseCount:0, archiveTimes:0,componentResNamePath:""}).write()
    }
    db.update('componentResNamePath', n => dirname.substring(dirname.indexOf("Arts"))).write()
    checkUpdate(dirname)
    if (isPreCheck){
        return
    }
    var retf = startSort(dirname)
    return retf;
}

function checkUpdate(dirname){
    var files = fs.readdirSync(dirname)
    var canUseCount = 0
    files.forEach((ele) => {
        if ((ele != EXCLUDE_FILENAME_RES_STATE_DIR) && (ele != EXCLUDE_FILENAME_DS_STORE)){
            var absoluteFilepath = path.join(dirname, ele)
            var stat = fs.statSync(absoluteFilepath)
            let md5str
            if(stat.isDirectory()){
                let option  = {ignore:EXCLUDE_FILENAME_DS_STORE}
                md5str = md5DirSync(absoluteFilepath,option)
            }
            if(stat.isFile()){
                md5str = md5FileSync(absoluteFilepath)
            }
            let template = {
                "md5":md5str,
                "fileName":ele,
                "lastTime":0,
                "useTimes":0,
            };
            let hasMd5 = db.get('resState').find({"md5":md5str}).value()
            let hasFileName = db.get('resState').find({"fileName":ele}).value()

            if (hasFileName && !hasMd5){
                console.log("发生改名1")
                db.get('resState').find({"fileName":ele}).assign({ "md5": md5str }).write()
            } 
            else if(hasMd5 && !hasFileName){
                console.log("重复资源,删除")
                fs.unlinkSync(absoluteFilepath)
            }
            else if (!hasMd5 && !hasFileName){
                console.log("添加新资源")
                db.get('resState').push(template).write()
            }
            else if(hasFileName && hasMd5){
                if (hasFileName.lastTime && hasFileName.lastTime != 0 ){
                    let date = new Date()
                    let difValue = date.getTime() - hasFileName.lastTime
                    //7天重置一次
                    if (Math.floor(difValue / 1000 / 60 / 60 / 24) >= TIME_DIFFERENCE){
                        console.log("重置资源")
                        db.get('resState').find({"fileName":ele}).assign({ "useTimes": 0 }).write()
                        db.get('resState').find({"fileName":ele}).assign({"lastTime":date.getTime()}).write()
                    }
                }
            }
            if( !hasFileName){
                canUseCount = canUseCount + EACH_RESOURCE_AVAILABLE_TIMES
            } 
            else if (hasFileName.useTimes < EACH_RESOURCE_AVAILABLE_TIMES){
                canUseCount = canUseCount + (EACH_RESOURCE_AVAILABLE_TIMES - hasFileName.useTimes)
            }
        }
    });
    console.log("precheck",canUseCount)
    db.update('canUseCount', n => canUseCount ).write()
}

function startSort(dirname){
    let recordFile = path.join(dirname,EXCLUDE_FILENAME_RES_STATE_DIR,"db.json")
    checkCanArchive(recordFile,dirname)
    let arr_list = db.getState()
    let arr  = arr_list.resState
    //打乱次序（交互取）
    arr.sort(function(){
        return 0.5 - Math.random()
    })
    arr.sort(function(a,b){
        return a.useTimes - b.useTimes
    })
    if(!arr[0] || arr[0].useTimes >= EACH_RESOURCE_AVAILABLE_TIMES){
        throw "没有资源可用,安排美术出图"
    }
    let date = new Date()
    arr.forEach((ele,index)=>{
        let selectFile = path.join(dirname,ele.fileName)
        if(!fs.existsSync(selectFile)){
            arr.splice(index,1)
        }
    })
    db.get('resState').find({"fileName":arr[0].fileName}).assign({"useTimes":arr[0].useTimes + 1 }).write()
    db.get('resState').find({"fileName":arr[0].fileName}).assign({"lastTime":date.getTime()}).write()
    var hahah = db.get('canUseCount').value()
    console.log("1",dirname,hahah)
    db.update('canUseCount', n => n-1).write()
    var hahah2 = db.get('canUseCount').value()
    console.log("2",dirname,hahah2)
    console.log(arr[0].fileName)
    return arr[0].fileName
}

function md5FileSync(dirname){
    var buf = fs.readFileSync(dirname)
    var md5 = crypto.createHash('md5');
    md5.update(buf)
    return md5.digest('hex')
}

function md5DirSync (dirname, options) {
    options = options || {}
  
    const ig = ignore()
  
    if (options.ignore) {
      ig.add(options.ignore)
    }
  
    function run (prefix) {
      const hash = crypto.createHash('md5')
      const files = fs.readdirSync(path.join(dirname, prefix))
  
      for (let i = 0; i < files.length; i++) {
        const relativeFilepath = path.join(prefix, files[i])
  
        if (ig.ignores(relativeFilepath)) {
          continue
        }
  
        const absoluteFilepath = path.join(dirname, relativeFilepath)
        const stat = fs.statSync(absoluteFilepath)
  
        if (stat.isFile()) {
          hash.update(md5FileSync(absoluteFilepath))
        }
  
        if (stat.isDirectory()) {
          hash.update(run(relativeFilepath))
        }
      }
      return hash.digest('hex')
    }
    return run('')
}

function backtrace(dirname){
    let files = fs.readdirSync(dirname)
    files.forEach(ele => {
        let absFile = path.join(dirname,ele)
        if(fs.existsSync(absFile)){
            if(fs.statSync(absFile).isDirectory()){
                backtrace(absFile)
            }
            if(ele == "db.json"){
                let archiveFile = path.join(dirname,"db_archive.json")
                if (fs.existsSync(archiveFile)){
                    fs.renameSync(archiveFile,absFile)
                }
            }
        }
    })
}

function setMinCanUseCount(){
    console.log(db.getState())
    var canUseCount = db.get("canUseCount").value()
    if (minCount === undefined){
        minCount = canUseCount
    }
    else{
        if(canUseCount < minCount){
            minCount = canUseCount
        }
    }
    console.log("最小值更新为",minCount)
}

//重置所有存档次数
function resetAllResArchiveTimes(dirname){
    let files = fs.readdirSync(dirname)
    files.forEach(ele => {
        let absFile = path.join(dirname,ele)
        if(fs.existsSync(absFile)){
            if(fs.statSync(absFile).isDirectory()){
                resetAllResArchiveTimes(absFile)
            }
            if(ele == "db.json"){
                let adapter = new FileSync(absFile)
                let new_db = low(adapter);
                new_db.update('archiveTimes', n => 0).write() 
            }
        }
    })
}

//检测是否能够存档
function checkCanArchive(recordFile, dirname){
    let destFile = path.join(dirname,EXCLUDE_FILENAME_RES_STATE_DIR,"db_archive.json")
    if(db.getState().archiveTimes == 0 ){
        fs.copyFileSync(recordFile,destFile)
        db.update('archiveTimes', n => n+1).write()
        console.log("开始存档",destFile)
    }
}


function getDataNode(datalist, value, key){
    for (let index = 0; index < datalist.size(); index++) {
        const t_node = datalist.get(index);
        let t = t_node.value()
        if (value == t[key]){
            return t_node;
        };
    }
    return undefined
}


function checkGitState(data){
    utils.comomGitPull("../", "Res_State", function(){
        let adapter = new FileSync(path.join(GIT_STATE_PATH,"Res_State.json"))
        let stateDb = low(adapter)
        if(!stateDb.has('stateMap').value()){
            stateDb.defaults({stateMap:[],isLock:data.isLock}).write()
        }
        stateDb.update('isLock', n => data.isLock).write()
        let stateMap = stateDb.get('stateMap')
        let childMap = getDataNode(stateMap,data.name,"name")
        if( ! childMap){
            console.log("总存储记录中没有找到该游戏，正在添加") 
            let template = { 
                name: data.name, 
                dir_structure: data.dir_structure,
                state:[
                    {
                        style:data.style,
                        styleName:data.styleName
                    }
                ]
            }
            stateMap.push(template).write()
            childMap = getDataNode(stateMap,data.name,"name")
        }
        childMap.update('dir_structure',n =>  data.dir_structure).write()
        let childStyleMap = getDataNode(childMap.get("state"),data.style,"style")
        if (!childStyleMap){
            let template = {style: data.style,minCount:data.minCount}
            childMap.get("state").push(template).write()
            childStyleMap = getDataNode(childMap.get("state"),data.style,"style")
        }
        childStyleMap.update('styleName', n =>  data.styleName).write()
        childStyleMap.update('minCount', n =>  data.minCount).write()
        console.log("配置完成","minCount",minCount)
        let shellFile = "./RecordState/git.sh"
        execSync("sh " + shellFile + " " + GIT_STATE_PATH)
        console.log("提交成功")
    })
}

module.exports = {
    archive:archive,
    backtrace:backtrace,
    preCheck:preCheck,
    reset:resetAllResArchiveTimes,
    update:checkGitState
}
