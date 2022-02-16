cc.FileUtils:getInstance():setPopupNotify(false)cc.FileUtils:getInstance():addSearchPath("src/")cc.FileUtils:getInstance():addSearchPath("res/")local function e()require("haoyue.main")end
local t,e=xpcall(e,function(e)local e=debug.traceback(e,3)print(e)return e
end)if not t then
print(e)end
