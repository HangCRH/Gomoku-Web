from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import random, gomoku

app = FastAPI()

origins = ["*"] #允许跨域请求的来源列表

#允许进行跨域请求(CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"]
)

class room():
    """
    表示一个房间的类，包含玩家列表、棋盘大小和棋盘数据等信息。
    Attributes:
        players: list[str] - 当前房间的玩家列表
        size_x: int - 当前房间棋盘的高度
        size_y: int - 当前房间棋盘的宽度
        board: list[list[str]] - 当前房间的棋盘数据
        white: str - 白方玩家的玩家名称
        black: str - 黑方玩家的玩家名称
    """
    def __init__(self, player_name: str, size_x: int, size_y: int):
        self.players: list[str] = [player_name]    #当前房间的玩家列表，初始只有创建者一个玩家
        self.size_x: int = size_x
        self.size_y: int = size_y
        self.board: list[list[str]] = [["empty" for j in range(size_x)] for i in range(size_y)]   #初始化棋盘数据，0表示空格
        self.white_player: str = "" #白方玩家
        self.black_player: str = "" #黑方玩家

    async def join_player(self, player_name: str):
        if len(self.players) >= 2:    #如果房间已经满员，拒绝加入房间
            return {
                "type": "error",
                "message": "room is full"
            }
        player_list.append(player_name)  #将玩家名称添加到当前玩家列表中
        self.players.append(player_name)   #将玩家名称添加到对应房间的玩家列表中
        #随机决定黑白方
        if random.randint(0, 1) == 0:
            self.white_player = self.players[0]
            self.black_player = self.players[1]
        else:
            self.white_player = self.players[1]
            self.black_player = self.players[0]
        message_data = {
                "type": "roomInfo",
                "data": {
                    "players": self.players,
                    "sizex": self.size_x,
                    "sizey": self.size_y,
                    "board": self.board,
                    "whilePlayer": self.white_player,
                    "blackPlayer": self.black_player
                }
            }
        #向房间中的所有玩家发送更新后的房间信息，包括玩家列表、棋盘大小和棋盘数据等
        for i in range(len(self.players)):
            await ws_manager.send_message(self.players[i], message_data)

class websocket_manager():
    """
    管理所有websocket连接的类。
    ## 为什么需要这个类？
    每个连接的路径操作函数都会因为监听消息而被阻塞，当有连接发送消息，服务器处理后，由于被阻塞而无法将处理好的结果转发。
    通过这个类，我们可以在一个地方集中管理所有的连接，并且在需要转发消息时，通过这个类转发，避开了阻塞的路径操作函数。
    Attributes:
        active_connections: dict[str, WebSocket] - 存储所有活跃连接的字典，key为玩家名称，value为对应的WebSocket对象
    """
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {} #存储所有活跃连接的字典，key为玩家名称，value为对应的WebSocket对象
    
    def connect(self, player_name: str, websocket: WebSocket):
        """添加一个新的连接到管理器中，使用玩家名称作为键，WebSocket对象作为值。"""
        self.active_connections[player_name] = websocket
    
    def disconnect(self, player_name: str):
        """根据玩家名称从管理器中移除一个连接。"""
        if player_name in self.active_connections:
            del self.active_connections[player_name]

    async def send_message(self, player_name: str, message: dict):
        """向指定玩家发送消息，消息以字典形式传递，会被转换为JSON格式发送。"""
        if player_name in self.active_connections:
            websocket = self.active_connections[player_name]
            await websocket.send_json(message)

ws_manager = websocket_manager()   #创建一个WebSocket管理器的实例，用于管理所有的WebSocket连接
room_list: dict[int, room] = {} #存储房间信息的字典，key为房间ID(注意是整数而不是字符串)，value为房间对象
player_list: list[str] = [] #当前玩家名称列表
allowed_room_ids: list[int] = [x for x in range(100000, 1000000)] #允许的房间ID

@app.websocket("/room")
async def websocket_entrypoint(websocket: WebSocket):
    """
    处理客户端的websocket请求的入口点。每一个客户端消息都在这里被监听。

    ## 消息格式

    ```
    {
        type: str,
        data: dict
    }
    ```

    - type: str - 请求的类型，可选值: `createRoom`, `joinRoom`, `close` 
    - data: dict - 请求的数据

    ### 创建房间

    应只在第一次发送时使用。

    ```
    {
        type: "createRoom",
        data: {
            playerName: str,
            sizex: int,
            sizey: int
        }
    }
    ```

    - playerName: str - 玩家名称
    - sizex: int - 棋盘高度
    - sizey: int - 棋盘宽度

    ### 加入房间

    应只在第一次发送时使用。

    ```
    {
        type: "joinRoom",
        data: {
            playerName: str,
            roomId: int
        }
    }
    ```

    - playerName: str - 玩家名称
    - roomID: int - 房间号

    ### 退出房间

    ```
    {
        type: "close",
        data: { }
    }
    ```
    """
    await websocket.accept()    #接受WebSocket连接
    this_player_name: str = ""   #当前连接的玩家名称
    room_id: int = -1    #当前连接所在的房间ID
    listening = True
    while listening:            #持续监听来自客户端的消息，直到收到关闭(结束游戏或有人断开)的消息为止
        try:
            data: dict = await websocket.receive_json()

            if data["type"] == "createRoom":    #如果收到创建房间的请求
                this_player_name = data["data"]["playerName"]     #记录收到的玩家名到这个ws会话
                if data["data"]["playerName"] in player_list:   #如果玩家名称已存在，拒绝创建房间
                    await websocket.send_json({
                        "type": "error",
                        "message": "player name already exists"
                    })
                    break   #直接断开，让客户端重新发送请求
                player_list.append(data["data"]["playerName"])  #将玩家名称添加到当前玩家列表中
                room_id = random.choice(allowed_room_ids)       #从允许的房间ID列表中随机选择一个作为新房间的ID
                allowed_room_ids.remove(room_id)                #将这个ID从允许的列表中移除，确保不会重复使用
                room_list[room_id] = room(                      #在房间列表中创建一个新的房间，包含玩家名称、棋盘大小和初始棋盘数据
                    player_name = data["data"]["playerName"],
                    size_x = data["data"]["sizex"],
                    size_y = data["data"]["sizey"]
                )

            elif data["type"] == "joinRoom":    #如果收到加入房间的请求
                this_player_name = data["data"]["playerName"]     #记录收到的玩家名到这个ws会话
                if data["data"]["playerName"] in player_list:   #如果玩家名称已存在，拒绝加入房间
                    await websocket.send_json({
                        "type": "error",
                        "message": "player name already exists"
                    })
                    break
                if data["data"]["roomId"] not in room_list:    #如果房间ID不存在，拒绝加入房间
                    await websocket.send_json({
                        "type": "error",
                        "message": "room id does not exist"
                    })
                    break
                ws_manager.connect(this_player_name, websocket) #把ws和玩家名称绑定并移交websocket管理器
                room_id = data["data"]["roomId"]
                await room_list[room_id].join_player(data["data"]["playerName"])

            elif data["type"] == "close":    #如果收到关闭的请求，停止监听并关闭连接
                listening = False
                if len(room_list[room_id].players) <= 1:   #如果房间中只有一个玩家了，删除这个房间
                    del room_list[room_id]   #从房间列表中删除这个房间
                if this_player_name in player_list:
                    player_list.remove(this_player_name)  #将玩家名称从当前玩家列表中移除
                ws_manager.disconnect(this_player_name)   #从WebSocket管理器中断开这个玩家的连接
                break   #退出监听循环，结束连接

        except Exception as e:   #如果在监听过程中发生任何异常(如连接断开)，停止监听并关闭连接
            listening = False
            if len(room_list[room_id].players) <= 1:   #如果房间中只有一个玩家了，删除这个房间
                del room_list[room_id]   #从房间列表中删除这个房间
            if this_player_name in player_list:
                player_list.remove(this_player_name)  #将玩家名称从当前玩家列表中移除
            ws_manager.disconnect(this_player_name)   #从WebSocket管理器中断开这个玩家的连接
            break       #退出监听循环，结束连接