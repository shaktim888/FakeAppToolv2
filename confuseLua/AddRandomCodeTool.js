
// var compoentwords = [
var headwords = [
    "get",
    "set",
    "change",
    "add",
    "print",
    "choose",
    "export",
    "handle",
    "local",
    "ret",
    "cnm"
]

var tailwords = [
    "tool",
    "scene",
    "node",
    "layer",
    "controller",
    "view",
    "helper",
    "func",
    "base",
    "for",
]

var funtypes = [
    "number",
    "string",
    "table",
    "node",
    "scene",
    "layer",
]

var CET4words = require("./hylibraries/CET-4-words.js")

var fs = require('fs');
var path = require('path');
var util = require("util");

//  addxlocalxmin
let getRandomNum = function (Min,Max){
    var Range = Max - Min;   
    var Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
}

let getAWord = function(arr){
    if (!arr){
        arr = cet_4_words;
    }
    var random_val = getRandomNum(0, arr.length - 1);
    return arr[random_val]
}

var AddRandomCodeTool = function(){
    this.getVarName = function(){
        var var_model = getAWord(headwords) + getAWord(cet_4_words) + "x%s" + getAWord(tailwords) 

        var random_val = Math.random()
        if (random_val > 0.5) {
            var_model = util.format(var_model, "")
        }else{
            var_model = util.format(var_model, getAWord(cet_4_words))
        }

        return var_model;
    }

    this.getLocalVar = function(){
        var var_model = "local " + this.getVarName()
        // console.log("getLocalVar => " + var_model);
        return var_model;
    }

    this.getDirectRetNumberFuncBody = function(){
        var func_model = "return " + getRandomNum(998, 99998)
        return func_model
    }

    this.getDirectRetStringFuncBody = function(){
        var func_model = "return \"" + getAWord() + "\""
        return func_model
    }

    this.getDirectRetTableFuncBody = function(){
        var func_model = "return {}"
        return func_model
    }

    this.getDirectRetNodeFuncBody = function(){
        var random_val = getRandomNum(0,2)
        
        var ret_val = ""
        if (random_val == 0){
            ret_val = "cc.Node:create()"
        }else if(random_val == 1){
            ret_val = "cc.Scene:create()"
        }else if(random_val == 2){
            ret_val = "cc.Layer:create()"
        }

        var func_model = "return " + ret_val
        return func_model
    }

    this.getFuncBody = function(functype){
        var random_val = getRandomNum(0, 3)
        if (random_val == 0){
            return this.getDirectRetNumberFuncBody()
        }else if(random_val == 1){
            return this.getDirectRetStringFuncBody()
        }else if(random_val == 2){
            return this.getDirectRetTableFuncBody()
        }else if(random_val == 3){
            return this.getDirectRetNodeFuncBody()
        }
    }

    // local function xxx() %s end
    // local xxx = function() %s end
    this.getLocalFunc = function(){
        var funcname = this.getVarName()
        var random_val = getRandomNum(0, 1)
        var func_model = ""
        if (random_val == 0){
            func_model = `local function %s () 
    %s 
end `
        }else{
            func_model = `local %s = function() 
    %s 
end`
        }
        var ret = util.format(func_model, funcname, this.getFuncBody())
        // console.log("getLocalFunc => " + ret)
        return ret;
    }

    this.produceCode = function(){
        var line_code = `
%s`
        var code = "%s"
        var random_val = getRandomNum(8,15)
        for(var i = 1;i< random_val;i++){
            var flag = Math.random(0,1)
            if (flag > 0.4){
                code = util.format(code, this.getLocalVar())
            }else{
                code = util.format(code, this.getLocalFunc())
            }

            if (i < random_val - 1){
                code = code + line_code;
            }
        }

        code = code + `
        `
        return code;
    }

    this.produce = function(count){
        for(var i = 0; i < count; i++){
            this.getLocalVar()
            this.getLocalFunc()
        }
    }

    this.addRandomCodeCheck = function(file, dstfile, addcode){
        if (fs.existsSync(file)){
            if (!dstfile){
                dstfile = file;
            }

            var des_parentpath = path.dirname(dstfile);
            if (!fs.existsSync(des_parentpath)){
                this.mkdirs(des_parentpath);
            };
            this.addRandomCode(file, dstfile, addcode);
        }
    }

    this.addRandomCode = function(file, dstfile, addcode){
        if (path.extname(file) == ".lua"){
            var filecontent = fs.readFileSync(file)
            if (filecontent.length == 0){
                return  true;
            }
            // 移除 BOM头
            //  console.log(file)
            if (filecontent[0].toString(16).toLowerCase() == "ef" && filecontent[1].toString(16).toLowerCase() == "bb" && filecontent[2].toString(16).toLowerCase() == "bf") {
                //EF BB BF 239 187 191  BOM头
                filecontent = filecontent.slice(3);
            }

            if (!addcode){
                addcode = this.produceCode()
            }
            
            if (!dstfile){
                dstfile = file;
            }
            var content = addcode + filecontent;
            fs.writeFileSync(dstfile, content);
            return true;
        }
    }

    this.mkdirs = function(dirs){
        printLog("mkdirs =>" + dirs);
        fs.mkdirSync(dirs, { recursive: true }, (err) => {
            printLog("mkdir =>" + dirs + "  succeed! ");
            if (err) throw err;
        });
    }
}


module.exports = AddRandomCodeTool;