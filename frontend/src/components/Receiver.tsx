import { useEffect } from "react";

// USE DIFFERENT BROWSERS TO CHECK (FOR SENDER AND RECEIVER)
export function Receiver() {
  //   const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    socket.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      let pc: RTCPeerConnection | null = null;
      // Receive offer from sender(signaling server)
      if (message.type === "createOffer") {
        // Create an RTCPeerConnection
        pc = new RTCPeerConnection();
        // Set remote description to the offer
        pc.setRemoteDescription(message.sdp);
        // Add new Ice candidate
        pc.onicecandidate = (e) => {
          console.log(e);
          if (e.candidate) {
            socket?.send(
              JSON.stringify({ type: "iceCandidate", candidate: e.candidate })
            );
          }
        };

        // Incoming video (attach it to video element to see)
        pc.ontrack = (event) => {
          const video = document.createElement("video");
          document.body.appendChild(video);
          video.srcObject = new MediaStream([event.track]);
          //   video.muted = true; // This is needed for chrome specific or use controls
          video.controls = true;
          video.play();

          //   if (videoRef.current) {
          //     videoRef.current.srcObject = new MediaStream([event.track]);
          //   }
        };
        // Create an answer
        const answer = await pc.createAnswer();
        // Set local description to be the answer
        await pc.setLocalDescription(answer);
        // send answer to other side through signaling server(here websocket)
        socket.send(
          JSON.stringify({ type: "createAnswer", sdp: pc.localDescription })
        );
      } else if (message.type === "iceCandidate") {
        if (pc !== null) {
          //@ts-ignore
          pc.addIceCandidate(message.candidate);
        }
      }
    };
  }, []);
  return (
    <div>
      Receiver
      {/* <video ref={videoRef}></video> */}
    </div>
  );
}
