from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}


    async def connect(self, websocket: WebSocket, chat_id: str):
        await websocket.accept()

        if chat_id not in self.active_connections:
            self.active_connections[chat_id] = []

        self.active_connections[chat_id].append(websocket)


    def disconnect(self, websocket: WebSocket, chat_id: str):
        if chat_id in self.active_connections:
            self.active_connections[chat_id].remove(websocket)

            if not self.active_connections[chat_id]:
                del self.active_connections[chat_id]

    async def broadcast_to_chat(self, chat_id: str, message_data: dict):
        if chat_id in self.active_connections:
            for connection in self.active_connections[chat_id]:
                await connection.send_json(message_data)