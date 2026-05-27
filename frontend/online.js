const BASE_URL = "localhost:23456";  //后端服务器地址(域名或ip地址)，不应包含协议部分
var socket;  //WebSocket对象
var playerName;  //玩家名称

function listenPopupMessage(event) {  //监听来自弹窗的消息
    var receivedData = event.data;
    console.log("parent收到消息: ", receivedData);

    if (receivedData.type === "pageLoaded") {  //如果弹窗页面加载完成
        console.log("房间选择页面已加载完成");
        popupWindow.postMessage({ type: "initData", data: { baseUrl: BASE_URL } }, "*");  //向弹窗发送初始化数据
    }
    else if (receivedData.type === "closeWindow") {  //如果收到关闭窗口的请求
        closePopup();
    }
    else if (receivedData.type === "createRoom") {  //如果收到创建房间的请求
        if (isrunning) {    //在线版在这里才询问是否结束未结束的游戏，离线版在点击新游戏按钮时就询问了
            if (!confirm("确定要终止本轮游戏，并开启新的一局吗？")) {
                return;
            }
        }
        startWebSocket(
            "create",
            receivedData.data.playerName,
            {
                sizex: receivedData.data.sizex,
                sizey: receivedData.data.sizey
            }
        )
        closePopup();   //开始游戏后关闭房间选择页面
    }
    else if (receivedData.type === "joinRoom") {    //加入房间
        if (isrunning) {    //在线版在这里才询问是否结束未结束的游戏，离线版在点击新游戏按钮时就询问了
            if (!confirm("确定要终止本轮游戏，并开启新的一局吗？")) {
                return;
            }
        }
        startWebSocket(
            "join",
            receivedData.data.playerName,
            {
                roomId: receivedData.roomId
            }
        )
        closePopup();   //开始游戏后关闭房间选择页面
    }
}

function onlineLoad() {
    document.getElementById("popupBackground").style.display = "block";  //显示遮罩层
    document.getElementById("popupFrame").style.display = "block";  //显示房间选择弹窗
    popupWindow = document.getElementById("popupFrame").contentWindow;  //获取弹窗的window对象
    popupWindow.location.href = "roomSelectPage/index.html";  //加载房间选择页面
    console.log("已打开房间选择页面");
    window.addEventListener("message", listenPopupMessage);  //监听message事件，接收来自弹窗的消息
}

function startWebSocket(type, name, data) {
    playerName = name;
    socket = new WebSocket("ws://" + BASE_URL + "/room");   //连接后端服务器的WebSocket接口
    if (type == "create") {
        socket.onopen = function () {   //连接成功后发送创建房间的请求，携带玩家名称和棋盘大小
            socket.send(JSON.stringify({
                type: "createRoom",
                data: {
                    playerName: playerName,
                    sizex: data.sizex,
                    sizey: data.sizey
                }
            }));
            console.log("WebSocket连接已打开，已发送创建房间的请求");
            isrunning = true;   //标记正在运行游戏
        }
        socket.onmessage = function (event) {
            console.log("收到服务器消息: ", event.data);
            var receivedData = JSON.parse(event.data);
            if (receivedData.type === "roomInfo") {

            } else if (receivedData.type === "") {

            }
        }
        socket.onclose = function () {
            console.log("WebSocket连接已关闭");
        }
        socket.onerror = function (error) {
            console.error("WebSocket发生错误: ", error);
            alert("连接服务器发生错误");
        }
    }
    else if (type == "join") {
        socket.onopen = function () {   //连接成功后发送加入房间的请求
            socket.send(JSON.stringify({
                type: "joinRoom",
                data: {
                    roomId: data.roomId
                }
            }));
            console.log("WebSocket连接已打开，已发送创建房间的请求");
            isrunning = true;   //标记正在运行游戏
        }
        socket.onmessage = function (event) {
            console.log("收到服务器消息: ", event.data);
            var receivedData = JSON.parse(event.data);
            if (receivedData.type === "roomCreated") {

            } else if (receivedData.type === "") {

            }
        }
        socket.onclose = function () {
            console.log("WebSocket连接已关闭");
        }
        socket.onerror = function (error) {
            console.error("WebSocket发生错误: ", error);
            alert("连接服务器发生错误");
        }
    }
}