var player = true;  //true为黑，false为白，默认黑先
var gamedata = new Array();
var isrunning = false;  //记录游戏是否在进行
var gamehistory = new Array();
var playtimes = 0;  //记录本局游戏回合数（黑白各下一子算一回合，不足一回合算一回合）

function outinfor() {
    var outstr = "游戏版本：2.0.0\n\n更新内容：\n\n";
    outstr += "一、内容更新\n";
    outstr += "1、修复Bug：在白方获胜时对局历史显示的获胜者是undefined。\n\n";
    outstr += "二、技术性更改\n";
    outstr += "无";
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
            load();
        } else {
            return;
        }
    } else {
        load();
    }
}

function load() { //生成棋盘，显示信息
    gamedata = new Array();
    playtimes = 1;
    var i = 1, j = 1;
    var imax = parseInt(document.getElementById("sizey").value);
    var jmax = parseInt(document.getElementById("sizex").value);
    console.log("imax=" + imax + ",jmax=" + jmax);
    if (Number.isNaN(imax) || Number.isNaN(imax)) {
        alert("输入的信息不是一个数字或是空值，请重试");
        return;
    }
    if (imax > 50 || imax < 5 || jmax > 50 || jmax < 5) {
        alert("输入的棋盘大小超出了范围(5~50)");
        return;
    }
    var outstr = "";
    for (i = 1; i <= imax; i++) {
        outstr += "<tr>";
        var childgamedata = new Array();
        for (j = 1; j <= jmax; j++) {
            outstr += '<td id="' + j + ',' + (imax - i + 1) + '">';
            outstr += '<img src="pic/empty.png" onclick="makeMove(' + j + ',' + (imax - i + 1) + ')">';
            outstr += '</td>';
            childgamedata.push(null);
        }
        outstr += "</tr>";
        gamedata.push(childgamedata);
    }
    document.getElementById("chessboard").innerHTML = outstr;
    var outstr2 = '当前棋手: <span id="outplayer" style="color:#ff6a00;font-size:25px">黑</span>';
    player = true;
    document.getElementById("outplayerarea").innerHTML = outstr2;
    document.getElementById("outarea2").innerHTML = "";
    console.log(gamedata);
    isrunning = true;
}

function makeMove(x, y) {
    //落子
    if (!isrunning) {
        return; //游戏结束后禁止落子，由于img不能被禁用，只能在这里禁用落子功能
    }
    var getblock = document.getElementById(x + "," + y);
    var outarea = document.getElementById("outplayer");
    outarea.innerHTML = "加载中";
    var imax = parseInt(document.getElementById("sizey").value);
    var outstring;
    if (player) {
        getblock.innerHTML = '<img src="pic/black.png">';
        outstring = "白";

    } else {
        getblock.innerHTML = '<img src="pic/white.png">';
        outstring = "黑";
    }
    gamedata[imax - y][x - 1] = player;
    console.log(gamedata);
    //胜负检测
    var winner = testwinner(imax - y, x - 1);
    if (winner && player) {
        document.getElementById("outarea2").innerHTML = "黑方最后落子，取得胜利！";
        outarea.innerHTML = player ? "黑" : "白";
        gamehistory.push(summonHistory("black"));   //记录本局游戏结果
        stopthisgame();
        return;
    }
    if (winner && !player) {
        document.getElementById("outarea2").innerHTML = "白方最后落子，取得胜利！";
        outarea.innerHTML = player ? "黑" : "白";
        gamehistory.push(summonHistory("white"));   //记录本局游戏结果
        stopthisgame();
        return;
    }
    player = !player;
    if (player == true) {
        playtimes += 1;
    }
    outarea.innerHTML = outstring;
}

function testwinner(a, b) {
    console.log("a=" + a + ",b=" + b);
    //左上至右下五子判定
    var cnt = 1;//计数变量。因为包含这次落的子本身，所以初始为1。
    var i = a - 1, j = b - 1;
    var imax = gamedata.length, jmax = gamedata[0].length;
    for (; 0 <= i && 0 <= j; i--, j--) { //左上
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    i = a + 1, j = b + 1;
    for (; i < imax && j < jmax; i++, j++) { //右下
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    if (cnt >= 5) {
        return true;
    }
    //右上至左下五子判定
    var cnt = 1;//计数变量。因为包含这次落的子本身，所以初始为1。
    var i = a - 1, j = b + 1;
    for (; 0 <= i && j <= jmax; i--, j++) { //右上
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    i = a + 1, j = b - 1;
    for (; i < imax && 0 < j; i++, j--) { //左下
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    if (cnt >= 5) {
        return true;
    }
    //左右五子判定
    var cnt = 1;//计数变量。因为包含这次落的子本身，所以初始为1。
    var i = a - 1, j = b;
    for (; 0 <= i; i--) { //左
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    i = a + 1, j = b;
    for (; i < imax; i++) { //右
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    if (cnt >= 5) {
        return true;
    }
    //上下五子判定
    var cnt = 1;//计数变量。因为包含这次落的子本身，所以初始为1。
    var i = a, j = b - 1;
    for (; 0 <= j; j--) { //上
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    i = a, j = b + 1;
    for (; j <= jmax; j++) { //下
        if (gamedata[i][j] == null) {
            break;
        }
        if (player ? gamedata[i][j] : !gamedata[i][j]) {
            cnt++;
        } else {
            break;
        }
    }
    if (cnt >= 5) {
        return true;
    }
    return false;
}

function stopthisgame() {
    isrunning = false;
}