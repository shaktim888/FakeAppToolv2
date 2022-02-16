###### 执行
npm install 
node Main.js 1 style_QiPai NiuNiu_Shu



###### 添加新游戏手动配置以下字段：produceicon_hallbg：合成Icon背景路径； isL： 是否横屏  “dir_structure”：change目录结构解释 
 
"other" : {
	"produceicon_hallbg": "src/haoyue/res/game/pdk/image/mainview/hall_bg.png",
	"isL":true,
	"dir_structure":{
        "game_bg":"游戏背景",
		"hall_bg":"大厅背景",
		"load_bg":"加载背景",
		"monster":"怪",
		"role":"三种尺寸的人"
	}
}
 
###### h5游戏需额外配置一下字段：  [0]:第一次点击位置 [1]:第二次点击位置 [2]:截图去除黑边之后游戏的宽高（若高铺满：可不写）[3]:三次点击延迟时间

"clickPos": [
	{ "x":1280, "y":710 },
	{ "x":1280, "y":1050 },
	{"width":5115},
	[7000, 5000, 2000]
],


##### haoyue 游戏混淆添加
"confuse":{
		"has":true,
		"type":"vdir",
		"entry":"haoyue",
		"exportentry":"random",
		"confusepath":"src/haoyue/"
},

额外安装

##### $ brew install geckodriver


