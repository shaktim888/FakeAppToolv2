#!/bin/bash -x
# 用于脚本调试
set +x
# 是 去掉左边（键盘上#在 $ 的左边）
# %是去掉右边（键盘上% 在$ 的右边）
# 字符串替换: ${str/pat/rep}，${s//pat/rep}, ${s/#pat/rep}, ${s/%pat/rep}
if [ x$1 != x ]
then
    echo $1
    cd $1
    echo $(ls -a)
    git add .
    git commit -m "auto FakeAppTool commit"
    git push --all
else
   echo $1
fi

# run_path=$(cd `dirname $0`; pwd)
# for file in $run_path/*
# do
#     if ! test -f $file; then
#         echo $file 
#         echo "+++++++++++++++++++++++++++++++++++"
#         cd $file
#         gitfile=$(ls -a .git 2> /dev/null )
#         if [ -z "$gitfile" ]; then
#             git init
#         fi
#         status=$(git status )
#         pat="nothing to commit"
#         rep="${status/$pat/}"    
#         if [ "$rep" == "$status" ]  
#         then  
#             ###有状态改变提交更新
#             echo "Not Contains"  
#             git add .
#             git commit -m "first commit"
#             git remote add origin http://192.168.0.222:9090/${file##*/}.git
#             git push --all
#         else  
#             #无更新
#             echo "Contains"  
#         fi  
#         echo "+++++++++++++++++++++++++++++++++++"
#     fi
# done


