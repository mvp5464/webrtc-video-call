"use strict";
// about:webrtc-internals //==>> For webrtc logs
// tsc -b && node dist/index.js  //==>> To start the websocket backend server
// http://localhost:5173/sender //==> Go to this link to send and
// http://localhost:5173/receiver //==>> Go to this link to receive the link
// You can open 4 tabs and create two calls
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let senderSocket = null;
let receiverSocket = null;
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    ws.on("message", function message(data) {
        const message = JSON.parse(data);
        if (message.type === "sender") {
            senderSocket = ws;
            console.log("sender set");
        }
        else if (message.type === "receiver") {
            receiverSocket = ws;
            console.log("receiver set");
        }
        else if (message.type === "createOffer") {
            if (ws !== senderSocket) {
                return;
            }
            console.log("offer created");
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "createOffer", sdp: message.sdp }));
        }
        else if (message.type === "createAnswer") {
            if (ws !== receiverSocket) {
                return;
            }
            console.log("answer created");
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "createAnswer", sdp: message.sdp }));
        }
        else if (message.type === "iceCandidate") {
            if (ws === senderSocket) {
                receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
            else if (ws === receiverSocket) {
                senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "iceCandidate", candidate: message.candidate }));
            }
        }
    });
});
