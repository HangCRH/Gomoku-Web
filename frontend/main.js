const WEBSITE_VERSION = "2.0.0";
var popupWindow;    //弹窗的window对象
var gamehistory = new Array();  //游戏历史记录数组，每完成一局游戏就往里面添加一个GameHistory对象，记录该局游戏的回合数和获胜者
var isrunning = false;  //记录游戏是否在进行

function outinfor() {
    var outstr;
    outstr = "游戏版本：" + WEBSITE_VERSION + "\n\n更新内容：\n\n" +
        "1、添加双人联机功能。\n" +
        "2、适配手机版。\n" +
        "3、添加预设棋盘大小选择。\n" +
        "4、界面翻新。\n\n";
    alert(outstr);
}

window.onbeforeunload = function () {
    return "确定要离开吗？当前进行的游戏将会中断，且游戏记录将会丢失！";
}

function showHistory() {
    var outstr = "对局历史：\n\n";
    if (gamehistory.length <= 0) {
        outstr += "当前暂无记录，请先至少完成1局游戏";
    }
    for (let i = 0; i < gamehistory.length; i++) {
        const element = gamehistory[i];
        getstr = element.toString();
        outstr += i + 1 + "\n";
        outstr += getstr + "\n\n";
    }
    alert(outstr);
}

class GameHistory { //游戏历史类
    constructor(times, winner) {
        this.times = times;
        this.winner = winner;
        if (winner != "black" && winner != "white") {   //如果传入的获胜者参数不合法，则视为游戏被主动结束，无获胜者
            this.winner = null;
        }
    }
    toString() {
        let returnString = "";
        if (this.winner === null) {
            returnString += "游戏被主动结束，无获胜者";
        } else {
            const playerEnToZh = {  //英文转中文映射
                black: "黑",
                white: "白"         //fuck
            }
            returnString += "获胜者：" + playerEnToZh[this.winner];
        }
        returnString += "\n回合数：" + this.times;
        return returnString;
    }
}

function summonHistory(winnercolor) {
    var newHistoryData = new GameHistory(playtimes, winnercolor);
    return newHistoryData;
}

function startgame() {
    if (document.getElementById("gamemode").value == "offline") {
        if (isrunning) {    //如果当前游戏正在进行，只在离线版询问是否结束，在线版在弹窗询问
            if (confirm("确定要终止本轮游戏，并开启新的一局吗？")) {
                if (player == true) {
                    playtimes -= 1;
                }
                gamehistory.push(summonHistory());
            } else {
                return;
            }
        }
        offlineLoad();
    } else if (document.getElementById("gamemode").value == "online") {
        onlineLoad();
    } else {
        console.error("游戏模式错误，gamemode=" + document.getElementById("gamemode").value);
        alert("游戏模式错误，请重试");
        return;
    }
}

function usePresetChessboard() {
    //根据预设棋盘选择框的值自动填写棋盘大小输入框
    var selectedSize = document.getElementById("presetChessboardSelect").value;
    var selectedSizeX, selectedSizeY;
    if (selectedSize == "10x10") {
        selectedSizeX = 10;
        selectedSizeY = 10;
    } else if (selectedSize == "15x15") {
        selectedSizeX = 15;
        selectedSizeY = 15;
    } else if (selectedSize == "20x20") {
        selectedSizeX = 20;
        selectedSizeY = 20;
    } else {
        selectedSizeX = null;
        selectedSizeY = null;
    }
    if (selectedSizeX && selectedSizeY) {
        document.getElementById("sizex").value = selectedSizeX;
        document.getElementById("sizey").value = selectedSizeY;
    }
}

function writeChessboardSize() {
    //当棋盘大小输入框失去焦点时，如果输入的棋盘大小与预设棋盘大小不同，则将预设棋盘选择框的值修改为"selfSet"，表示使用自定义棋盘大小
    var sizex = parseInt(document.getElementById("sizex").value);
    var sizey = parseInt(document.getElementById("sizey").value);
    if ((sizex == 10 && sizey == 10) || (sizex == 15 && sizey == 15) || (sizex == 20 && sizey == 20)) {
        return; //如果输入的棋盘大小与预设棋盘大小相同，则不修改预设棋盘选择框的值，保持其原有状态
    }
    document.getElementById("presetChessboardSelect").value = "selfSet";
}

function closePopup() {
    document.getElementById("popupBackground").style.display = "none";  //隐藏遮罩层
    document.getElementById("popupFrame").style.display = "none";  //隐藏房间选择弹窗
    popupWindow.location.href = "about:blank";  //重置弹窗页面
    window.removeEventListener("message", listenPopupMessage);  //移除消息监听器
    console.log("已关闭房间选择页面");
}