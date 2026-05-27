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