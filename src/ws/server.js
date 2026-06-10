import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arject.js";
// Helper Functions
 function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

function broadcast(wss,payload){
    for(const client of wss.clients){
        if(client.readyState !== WebSocket.OPEN) continue;
        try {
            client.send(JSON.stringify(payload));
        } catch (error) {
            console.error('Failed to send payload to client:', error);
            client.terminate();
        }
    }
}

export function attachWebSocketServer(server){
    const wss = new WebSocketServer({
        server,
        path:'/ws',
        maxPayload: 1024 *1024,
    })

    wss.on('connection',async(socket, req)=>{
        if(wsArcjet){
            try {
                const decision = await wsArcjet.protect(req)
                if (decision.isDenied) {
                    const isRateLimit = decision.reason && decision.reason.isRateLimit;
                    const code = isRateLimit ? 1013 : 1008;
                    const reason = isRateLimit ? 'Rate limit exceeded' : 'Access Denied';
                    socket.close(code, reason);
                    return;
                }
            } catch (error) {
                console.error('ws Connection error', error)
                socket.close(1011,'Server Security error');
                return;
            }
        }

        socket.isAlive = true
        socket.on('pong',()=>{
            socket.isAlive = true
        })
        sendJson(socket, {type: 'welcome'})
        socket.on('error', console.error)
    })

    const interval = setInterval(()=>{
        wss.clients.forEach((ws)=>{
            if(ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping()
        })
    },30000)

    wss.on('close',()=>clearInterval(interval))

    function broadcastMatchCreated(match){
        broadcast(
            wss,
            {
                type:"match_created",
                data: match,
            }
        )
    }
    return {broadcastMatchCreated}
}