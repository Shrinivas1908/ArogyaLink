"""
Arogya Link — api/v1/ws_notifications.py
=========================================
Phase 7 — Real-Time WebSocket Notification Manager for Doctors.
"""

from __future__ import annotations

import json
from typing import Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websockets"])


class ConnectionManager:
    """Manages active doctor WebSocket connections."""

    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast real-time emergency alert payload to all connected doctors."""
        payload_str = json.dumps(message)
        to_remove = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload_str)
            except Exception:
                to_remove.append(connection)

        for conn in to_remove:
            self.disconnect(conn)


manager = ConnectionManager()


@router.websocket("/ws/notifications")
async def websocket_notifications_endpoint(websocket: WebSocket) -> None:
    """WebSocket connection endpoint for Doctor Dashboard real-time alerts."""
    await manager.connect(websocket)
    try:
        while True:
            # Keepalive / listen for client ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
