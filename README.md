
# The code for testing the pub/sub in the browser console websocket
```javascript
const fanA = new WebSocket("ws://localhost:8000/ws");

fanA.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  console.log("%c[Fan A - Match 1 Only]", "color: #00ff00; font-weight: bold", msg);

  // Wait for the welcome signal before subscribing
  if (msg.type === "welcome") {
    fanA.send(JSON.stringify({ type: "subscribe", matchId: 1 }));
    console.log("Fan A subscribed to Match 1");
  }
};

fanA.onopen = () => {
  console.log("Fan A connection opened. Waiting for server welcome...");
};
```