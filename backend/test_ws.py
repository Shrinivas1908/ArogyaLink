import asyncio
import json
import websockets

async def test_ws():
    uri = "ws://127.0.0.1:8000/ws/notifications"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            await websocket.send("ping")
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print("Received from WS:", response)
    except Exception as e:
        print("WebSocket connection failed:", e)

if __name__ == "__main__":
    asyncio.run(test_ws())
