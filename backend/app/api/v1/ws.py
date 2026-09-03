"""
Arogya Link — api/v1/ws.py
==========================
WebSocket Connection Manager for Real-Time Doctor Queue and Triage Notifications.
"""

from __future__ import annotations

import json
import logging
from typing import Any, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("arogya_link.ws")
router = APIRouter(prefix="/ws", tags=["websockets"])


class ConnectionManager:
    """Manages active WebSocket connections for doctors, clinics, and portals."""

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: dict[str, Any]) -> None:
        """Broadcast a message event to all connected doctor dashboards & clients."""
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as exc:
                logger.warning(f"Failed to send to client: {exc}")
                disconnected.append(connection)

        for dead_conn in disconnected:
            self.disconnect(dead_conn)


# Global singleton instance
ws_manager = ConnectionManager()


@router.websocket("/queue")
async def websocket_queue_endpoint(websocket: WebSocket) -> None:
    """Doctor dashboard queue live updates stream."""
    await ws_manager.connect(websocket)
    try:
        # Send initial confirmation handshake
        await websocket.send_text(json.dumps({
            "event": "CONNECTED",
            "message": "ArogyaSetu Real-time Queue Stream Active"
        }))
        while True:
            # Keep connection alive and listen for client heartbeats or ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event": "PONG"}))
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
