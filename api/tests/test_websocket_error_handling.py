#!/usr/bin/env python3
"""
Test script to verify WebSocket error handling improvements.
This script simulates various WebSocket disconnection scenarios.
"""

import asyncio
import websockets
import json
import sys

# Base URL for the API
BASE_URL = "ws://localhost:8000"

async def test_chat_disconnect():
    """Test chat endpoint disconnection handling"""
    print("\n=== Testing Chat Endpoint Disconnection ===")
    try:
        async with websockets.connect(f"{BASE_URL}/api/chat") as websocket:
            # Send initial thread ID
            await websocket.send(json.dumps({"threadId": "test-thread-123"}))
            print("✓ Connected to chat endpoint")
            
            # Send a message
            await websocket.send(json.dumps({
                "name": "Test User",
                "text": "Hello, test message",
                "image": None
            }))
            print("✓ Sent test message")
            
            # Wait briefly for response
            await asyncio.sleep(1)
            
            # Abruptly close the connection
            await websocket.close()
            print("✓ Closed connection gracefully")
            
    except Exception as e:
        print(f"✗ Error during chat test: {e}")

async def test_voice_disconnect():
    """Test voice endpoint disconnection handling"""
    print("\n=== Testing Voice Endpoint Disconnection ===")
    try:
        async with websockets.connect(f"{BASE_URL}/api/voice") as websocket:
            # Send initial context
            await websocket.send(json.dumps({
                "type": "messages",
                "payload": json.dumps([])
            }))
            print("✓ Sent initial context")
            
            # Send user settings
            await websocket.send(json.dumps({
                "type": "user",
                "payload": json.dumps({
                    "user": "Test User",
                    "threshold": 0.8,
                    "silence": 500,
                    "prefix": 300
                })
            }))
            print("✓ Sent user settings")
            
            # Wait briefly
            await asyncio.sleep(1)
            
            # Abruptly close the connection
            await websocket.close()
            print("✓ Closed connection gracefully")
            
    except Exception as e:
        print(f"✗ Error during voice test: {e}")

async def test_rapid_connect_disconnect():
    """Test rapid connection/disconnection cycles"""
    print("\n=== Testing Rapid Connect/Disconnect ===")
    for i in range(3):
        try:
            async with websockets.connect(f"{BASE_URL}/api/chat") as websocket:
                await websocket.send(json.dumps({"threadId": f"rapid-test-{i}"}))
                # Immediately close
                await websocket.close()
                print(f"✓ Rapid test {i+1} completed")
        except Exception as e:
            print(f"✗ Rapid test {i+1} failed: {e}")
        await asyncio.sleep(0.1)

async def main():
    """Run all tests"""
    print("Starting WebSocket Error Handling Tests...")
    print("Make sure the API server is running on http://localhost:8000")
    
    await test_chat_disconnect()
    await test_voice_disconnect()
    await test_rapid_connect_disconnect()
    
    print("\n=== Test Summary ===")
    print("Tests completed. Check the API server logs for any errors.")
    print("If no RuntimeError or 'Unexpected ASGI message' errors appear, the fixes are working correctly.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        sys.exit(0) 