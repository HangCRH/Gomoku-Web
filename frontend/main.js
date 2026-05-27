const WEBSITE_VERSION = "2.0.0";
var player = true;  //true为黑，false为白，默认黑先
var gamedata = new Array();
var isrunning = false;  //记录游戏是否在进行
var gamehistory = new Array();
var playtimes = 0;  //记录本局游戏回合数（黑白各下一子算一回合，不足一回合算一回合）

function outinfor() {
    var outstr = "游戏版本：" + WEBSITE_VERSION + "\n\n更新内容：\n\n" +
        "1、修复Bug：在白方获胜时对局历史显示的获胜者是undefined。\n\n";
    alert(outstr);
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
    if (isrunning) {
        if (confirm("确定要终止本轮游戏，并开启新的一局吗？")) {
            if (player == true) {
                playtimes -= 1;
            }
            gamehistory.push(summonHistory());
            offlineLoad();
        } else {
            return;
        }
    } else {
        offlineLoad();
    }
}

function stopthisgame() {
    isrunning = false;
}