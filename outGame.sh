#!/bin/bash -ilex


GAME_STYLE=${1}
GAME_NAME=${2}
BUILD_NUMBER=${3}
JOB_NAME=${4}
WORKSPACE=${5}
NOTIFY_TG=${6}

FAKE_APP_TOOL_PATH=${WORKSPACE}/FakeAppToolv2
GAME_RES_PATH=$FAKE_APP_TOOL_PATH/output/$GAME_STYLE/$GAME_NAME/$BUILD_NUMBER

cd $WORKSPACE
mkdir -p ./output/
cd $FAKE_APP_TOOL_PATH

OUTPUT_PATH="$FAKE_APP_TOOL_PATH/output/"

#生成lua小游戏资源
echo "run FakeAppToolv2"
rm -rf $OUTPUT_PATH
mkdir -p $OUTPUT_PATH
npm install
echo "npm install done....."
echo $GAME_STYLE
node ./Main.js 1 $GAME_STYLE $GAME_NAME $BUILD_NUMBER
if test ! -d $GAME_RES_PATH; then
    echo "not exist the outputPath"
else
    cd $GAME_RES_PATH
    ZIP_PATH=$GAME_RES_PATH/${GAME_NAME}_$BUILD_NUMBER.zip
    zip -qr $ZIP_PATH .
    mv $ZIP_PATH $WORKSPACE/output/
fi

#拷贝资源到下载目录
cd $WORKSPACE

echo "\n---------- Download Info ----------" > download_info.txt
full_zip_path=$WORKSPACE/output/${GAME_NAME}_$BUILD_NUMBER.zip
project_folder=~/wwwroot/game_res/${JOB_NAME}
o_res_folder=${project_folder}/${BUILD_NUMBER}/

mkdir -p ${o_res_folder}
pwd
cp -rf ${full_zip_path} ${o_res_folder}
rm -rf ${full_zip_path}

echo 内网lua小游戏下载链接: http://192.168.0.222/game_res/${JOB_NAME}/${BUILD_NUMBER}/${GAME_NAME}_$BUILD_NUMBER.zip >> download_info.txt

cat download_info.txt

if [ ${NOTIFY_TG} == 1 ];then
    # echo "notify to telegram message..."
    python3 shell/bot_main.py download_info.txt download_url
fi
