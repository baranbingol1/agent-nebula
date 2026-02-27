from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.simulation_engine import ws_manager

router = APIRouter()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    await ws_manager.connect(room_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(room_id, websocket)
