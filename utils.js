
var path = require("path");
var fs = require("fs");
var url  = require("url");
var http = require("http");
var sizeOf = require('image-size');
const { execSync } = require('child_process');
var JavaScriptObfuscator = require('javascript-obfuscator');
const EXCLUDE_FILENAME_RES_STATE_DIR = ".DB_State"
var define = require("./define")
var AddRandomCodeTool = require("./confuseLua/AddRandomCodeTool.js")
addRandomCode = new AddRandomCodeTool();


function Tools(){
	this.comomGitPull = function(cdPath , gitName, cb)
	{
		this.mkdirs(path.join(cdPath, gitName))
		require('simple-git')(path.join(cdPath, gitName))
	    .checkIsRepo((err,isRepo) => {
	        if(isRepo){
	        	execSync("git fetch --all && git reset --hard origin/master && git pull ", {cwd:path.join(cdPath, gitName)})
	            if(cb) { cb() }
	        } else {
	            execSync("git clone " + define.GIT_URL(gitName) ,{cwd:cdPath})
	            if(cb) { cb() }
	        }
	    });
	}
	this.mkdirs = function(dirs){
		if(!fs.existsSync(dirs)){
			fs.mkdirSync(dirs, { recursive: true }, (err) => {
				if (err) throw err;
			});
		}
	}
	this.getRandDregree = function(arr1, arr2) {
		var sum = 0,
			factor = 0,
			random = Math.random();
	
		for(var i = arr2.length - 1; i >= 0; i--) {
			sum += arr2[i]; // 统计概率总和
		};
		random *= sum; // 生成概率随机数
		for(var i = arr2.length - 1; i >= 0; i--) {
			factor += arr2[i];
			if(random <= factor) 
			  return arr1[i];
		};
		return null;
	};
	
	this.GetRandomNum = function(Min,Max){
		var Range = Max - Min;   
		var Rand = Math.random();   
		return(Min + Math.round(Rand * Range));   
	}

	
	this.getRandNum = function(path){
		var count = this.getfileCount(path);
		var randomindex = this.GetRandomNum(0, count - 1);
		return randomindex
	}
	
	//文字适配居中
	this.labelAdjust = function(params,bgimg){
		if (typeof(params) == "string"){
			var bgSize = sizeOf(bgimg)
			var size1 = sizeOf(params)
			return bgSize.width/2 - size1.width/2
		}
		else if (typeof(params) == "object"){
			var bgSize = sizeOf(bgimg)
			var arr = []
			for (var ele in params){
				var size = sizeOf(params[ele])
				arr.push(bgSize.width/2 - size.width/2)	
			}
			return arr
		}
		
	}
	this.calcImagePos = function(bgimg,img,str){
		var sizebg = sizeOf(bgimg)
		var size = sizeOf(img)
		y = sizebg.height - size.height
		var x = sizebg.width - size.width
		return {x,y}
	}

	this.getMoreRandFromDir = function(dir){
		let count = this.getfileCount(dir)
		let arr = []
		for (let i = 0;i<count;i++){
			arr.push(i)
		}
		arr.sort(function(){
			return 0.5 - Math.random()
		})
		let file = []
		for (let i in arr){
			file[i] = this.getfileFilterDS_Store(dir,arr[i])
			let temp = path.join(dir,file[i])
			if (fs.statSync(temp).isDirectory()){
				var rand = this.getRandNum(temp)
				file[i] = path.join(file[i],this.getfileFilterDS_Store(temp,rand))
			}
		}
		return file
	}

	this.getMoreRandFromDir_FullPath = function(dir){
		let count = this.getfileCount(dir)
		let arr = []
		for (let i = 0;i<count;i++){
			arr.push(i)
		}
		arr.sort(function(){
			return 0.5 - Math.random()
		})
		let file = []
		for (let i in arr){
			file[i] = this.getfileFilterNew(dir,arr[i])
			if (fs.statSync(file[i]).isDirectory()){
				file[i] = this.getRandFile(file[i])
			}
		}
		return file
	}
	

	this.getRandFile = function(dir){
		var randNum = this.getRandNum(dir)
		var file = this.getfileFilterNew(dir,randNum)
		return file
	}

	this.H5ShootScreen = function(h5path){
	
		this.JSShootScreen(h5path)
	}
	// 返回全路径图片
	this.getfileFilterNew= function(dir, index){
		var count =  0;
		var ret;
		var files = fs.readdirSync(dir)
		for(var i in files){
			if (path.basename(files[i]) != ".DS_Store"){
				if (count == index){
					var fullPathFile = path.join(dir,files[i])
					return fullPathFile
				}
				count = count + 1
			}else{
				
			};
		}
		
		return ret;
	}	
	//只返回图片
	this.getfileFilterDS_Store = function(dir, index){
		var count =  0;
		var ret;
		var files = fs.readdirSync(dir)
		for(var i in files){
			if (path.basename(files[i]) != ".DS_Store" && files[i] != EXCLUDE_FILENAME_RES_STATE_DIR) {
				if (count == index){
					return files[i]
				}
				count = count + 1
			}else{
				
			};
		}
		
		return ret;
	}

	this.getfileCount = function(workpath){
		var count =  0;
		var files = fs.readdirSync(workpath);  
		for(var i in files){
			if (path.basename(files[i]) != ".DS_Store" && files[i] != EXCLUDE_FILENAME_RES_STATE_DIR){
				count = count + 1;
			}else{
				
			};
		}
		return count;
	}
	this.islandscape = function(img){
		var size = sizeOf(img)
		if (size.width > size.height){
			return true
		}else{
			return false
		}
	}

	// this.printOnce = function (){
	// 	console.log(deviceName,'宣传图制作成功');
	// 	// exec('open ' + outPath);
	// 	this.printOnce = undefined
	// }

	this.removeDir = function(rdir){
		// tmp 目录必须存在
        let files = [];
        if(fs.existsSync(rdir)){
            files = fs.readdirSync(rdir)
            files.forEach((file, index) => {
                let curPath = path.join(rdir,file)
                if(fs.statSync(curPath).isDirectory()){
                    this.removeDir(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            fs.rmdirSync(rdir);
        }
	};
	
	this.explorer = function(img_path){
		var ab_path = img_path
		if (img_path.indexOf("Users") == -1){
			ab_path = path.join(process.cwd(),img_path)
		}
		var files = fs.readdirSync(ab_path);
		var thistool = this;
        files.forEach(
			function(file){
				var filepath = path.join(ab_path,file)
				var info = fs.statSync(filepath);
				if(info.isDirectory()){                 
					// 如果是文件夹遍历
					thistool.explorer(filepath);
				}else{
					// 读出所有的文件
					console.log('压缩文件:' ,filepath);
					if (file!=".DS_Store"){
						if (file.indexOf("png") != -1){
							var name = filepath
							execSync("./autoGenScreenShot/pngquant/pngquant " + name)
							execSync("convert "+"\""+name+"\" -background white -alpha remove -alpha off "+"\""+name+"\"");
							execSync("rm -f " + name);
						}
					}
					
				}               
			}
		);
	}
	//js混淆

	function isJSON(str) {
        if (typeof str == 'string') {
            try {
                var obj=JSON.parse(str);
                if(str.indexOf('{')==1){
                    return false;
                }else{
                    return true;
                }

            } catch(e) {
                console.log(e);
                return false;
            }
        }
        return false;
	}

	this.JSObfuscator = function(jspath){
		console.log("111")

		var ab_path = path.join(process.cwd(),jspath) 

		if (jspath.indexOf("/Users") != -1 ){
			ab_path = jspath
		}
		console.log(ab_path)
		var files = fs.readdirSync(ab_path)
		var thistool = this;
        files.forEach(
			function(file){
				var filepath = path.join(ab_path,file)
				var info = fs.statSync(filepath);
				if(info.isDirectory()){                 
					// 如果是文件夹遍历
					thistool.JSObfuscator(filepath);
				}else{
					// 读出所有的文件
					if (path.extname(filepath) == ".js"){
						console.log('混淆:' ,filepath);
						var code = fs.readFileSync(filepath,"utf8")
						if (code.indexOf('{')!=1 && code.indexOf('{')!=0){
							var obfuscationResult = JavaScriptObfuscator.obfuscate(
								fs.readFileSync(filepath, 'utf8')
								,
								{
									compact: false,
									controlFlowFlattening: false,
									deadCodeInjection: false,
									debugProtection: false,
									debugProtectionInterval: false,
									disableConsoleOutput: true,
									identifierNamesGenerator: 'hexadecimal',
									log: false,
									renameGlobals: false,
									rotateStringArray: true,
									selfDefending: true,
									stringArray: false,
									stringArrayEncoding: false,
									stringArrayThreshold: 0.75,
									unicodeEscapeSequence: false
								}
							).getObfuscatedCode()
							fs.writeFileSync(filepath, obfuscationResult);
						}
					}
				}               
			}
		);
	}

	this.LuaObfuscator = function(luapath){
		var ab_path = path.join(process.cwd(),luapath) 
		if (luapath.indexOf("/Users") != -1 ){
			ab_path = luapath
		}
		// console.log(ab_path)
		var files = fs.readdirSync(ab_path)
		var thistool = this;
        files.forEach(
			function(file){
				var filepath = path.join(ab_path,file)
				var info = fs.statSync(filepath);
				if(info.isDirectory()){                 
					// 如果是文件夹遍历
					thistool.LuaObfuscator(filepath);
				}else{
					// 读出所有的文件
					if (path.extname(filepath) == ".lua"){
						// console.log('混淆lua:' ,filepath);
						addRandomCode.addRandomCode(filepath);
						var obfPath = path.join(process.cwd(),"./confuseLua/lua/lua53")
						var luaPath = path.join(process.cwd(),"lua")
						// execSync(obfPath + " ./obf.lua --minify --input " + filepath,{cwd:luaPath})
					}
				}               
			}
		);
	}
	this.JSScreenShot = function(jspath){
		var ab_path = path.join(process.cwd(),jspath) 
		
		if (jspath.indexOf("/Users") != -1 ){
			ab_path = jspath
		}
		console.log(ab_path)
		var files = fs.readdirSync(ab_path)
		var thistool = this;
        files.forEach(
			function(file){
				var filepath = path.join(ab_path,file)
				var info = fs.statSync(filepath);
				if(info.isDirectory()){                 
					// 如果是文件夹遍历
					thistool.JSObfuscator(filepath);
				}else{
					// 读出所有的文件
					if (path.extname(filepath) == ".html"){
						html2canvas(document.body, {
							allowTaint: true,
							taintTest: false,
							onrendered: function(canvas) {
								canvas.id = "mycanvas";
								//document.body.appendChild(canvas);
								//生成base64图片数据
								var dataUrl = canvas.toDataURL();
								var newImg = document.createElement("img");
								newImg.src =  dataUrl;
								document.body.appendChild(newImg);
							}
						});
					}
				}               
			}
		);
	}
	
	//全部递归重命名
	this.renameFile = function(rdir){
		// tmp 目录必须存在
		let files = [];
		let indexNum = 0
        if(fs.existsSync(rdir)){
			files = fs.readdirSync(rdir)
            files.forEach((file, index) => {
                let curPath = path.join(rdir,file)
                if(fs.statSync(curPath).isDirectory()){
                    this.renameFile(curPath) //递归文件夹
                } else {
					if (file != ".DS_Store") {
						indexNum = indexNum + 1
						let newPath = path.join(rdir,"card_" + indexNum+".png")
						if (path.extname(curPath) == ".png" || path.extname(curPath) == ".jpg"){
							console.log(curPath,"进行重命名")
							fs.renameSync(curPath,newPath)
						}
					}
                }
            });
        }
	};

	//增加资源重命名
	this.addRenameFile = function(rdir,newDir,start_number){
		let files = [];
		let indexNum = 0
        if(fs.existsSync(rdir)){
			files = fs.readdirSync(rdir)
            files.forEach((file, index) => {
				if (file != ".DS_Store") {
					indexNum = indexNum + 1
					let curPath = path.join(rdir,file)
					let newPath
					if(fs.statSync(curPath).isDirectory()){
						newPath = path.join(newDir,"style" + (indexNum+start_number))
					}
					else {
						newPath = path.join(newDir,(indexNum+start_number)+".png")
					}
					if (!newPath) { throw "this file can not rename"}
					console.log(curPath,"进行重命名为",newPath)
					fs.renameSync(curPath,newPath)
				}
			});
        }
	}

	//目录导出Json (后期开发)
	this.dir_to_json = function(rdir){
		// tmp 目录必须存在
        let files = [];
        if(fs.existsSync(rdir)){
			files = fs.readdirSync(rdir)
			var msg = JSON.stringify(files);
			console.log(msg)
			fs.writeFileSync("./dir_to_json.json",JSON.stringify(msg))
            files.forEach((file, index) => {
                let curPath = path.join(rdir,file)
                if(fs.statSync(curPath).isDirectory()){
                    this.dir_to_json(curPath); 
                } else {
					if (path.extname(curPath) != ".DS_Store"){
						
					}
					
                }
            });
        }
	};
	this.getFileAllChilds = function (dirname){
		let list = []
		if(fs.existsSync(dirname)){
			files = fs.readdirSync(dirname)
            files.forEach((ele) => {
				if (ele!= ".DS_Store"){
					let file = path.join(dirname,ele)	
					list.push(file)	
				}
            });
		}
		return list
	}
	this.CopyDirectory = function(src,dest) {
		var dirs = fs.readdirSync(src);
		var self = this
		dirs.forEach(function(item){
			var item_path = path.join(src, item);
			var temp = fs.statSync(item_path);
			if (temp.isFile()) {
				self.mkdirs(dest)
				fs.copyFileSync(item_path, path.join(dest, item));
			} else{
				self.CopyDirectory(item_path, path.join(dest, item))
			}
		});
	}

	this.compressZip = function(dir){
		var dest = "output/package.zip"
		execSync("zip -qr " + dest + " " + dir)
		var files = fs.readdirSync(dir)
        files.forEach(
			function(file){
				var filepath = path.join(dir,file)
				if (path.extname(filepath) != ".zip"){
					if(fs.statSync(filepath).isDirectory())
						this.removeDir(filepath)
					else{
						execSync("rm -f " + filepath)
					}
				}
			}
		);
	}
	this.getRandEle = function(arr){
		arr.sort(function(){
			return 0.5 - Math.random()
		})
		return arr[0]
	}

	
}

module.exports = Tools