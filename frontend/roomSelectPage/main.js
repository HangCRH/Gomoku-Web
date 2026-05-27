var baseUrl = "";   //后端服务器地址(域名或ip地址)，不应包含协议部分，从父窗口的消息获取

function listenParentMessage(event) {
    var receivedData = event.data;
    console.log("frame收到消息: ", receivedData);
    if (receivedData.type === "initData") {
        baseUrl = receivedData.data.baseUrl;
    }
}

function init() {
    // 从父窗口接收数据
    window.addEventListener("message", listenParentMessage);
    window.parent.postMessage({ type: "pageLoaded" }, "*");  //向父窗口发送消息，通知页面已加载完成
    //在页面加载完成后执行的初始化函数
}
document.addEventListener("DOMContentLoaded", init);  //监听DOMContentLoaded事件，确保在页面加载完成后执行init函数

function closeRoomSelectPage() {
    //向父窗口请求关闭房间选择页面
    window.parent.postMessage({ type: "closeWindow" }, "*");
}

function joinRoom() {
    var roomId = document.getElementById("roomIdInput").value;
    var playerName = document.getElementById("playerNameInput").value;
    if (!roomId) {
        alert("请输入房间ID");
        return;
    }
    if (!/^[0-9]{6}$/.test(roomId)) {
        alert("房间ID应为6位数字");
        return;
    }
    window.parent.postMessage({ //向父窗口发送创建房间的请求，父窗口会转发给后端服务器(这个时候就要使用ws了而不是post)
        type: "joinRoom",
        data: {
            playerName: playerName,
            roomId: roomId
        }
    }, "*");
}

function createRoom() {
    // 创建房间的函数，获取玩家名称和棋盘大小，向后端发送创建房间的请求
    var playerName = document.getElementById("createPlayerNameInput").value;
    var sizex = parseInt(document.getElementById("sizex").value);
    var sizey = parseInt(document.getElementById("sizey").value);
    if (isNaN(sizex) || isNaN(sizey) || sizex < 5 || sizey < 5 || sizex > 50 || sizey > 50) {
        alert("请输入有效的棋盘大小(5~50)");
        return;
    }
    if (!playerName) {
        alert("请输入昵称");
        return;
    }
    if (!/^[A-Za-z0-9]{3,15}$/.test(playerName)) {
        alert("昵称必须只包含数字和英文字母，且长度必须在3~15内")
        return;
    }
    window.parent.postMessage({ //向父窗口发送创建房间的请求，父窗口会转发给后端服务器(这个时候就要使用ws了而不是post)
        type: "createRoom",
        data: {
            playerName: playerName,
            sizex: sizex,
            sizey: sizey
        }
    }, "*");
}