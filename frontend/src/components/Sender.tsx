import { useEffect, useState } from "react";

export function Sender() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  useEffect(() => {
    send();
  }, []);

  function send() {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "sender" }));
    };
    setSocket(socket);
  }
  async function startSendingVideo() {
    if (!socket) return;
    // Create an RTCPeerConnection [create pc object of class RTCPeerConnection]
    const pc = new RTCPeerConnection();

    // whenever the new negotiation needed (when new audio or video is added to the webRTC)
    pc.onnegotiationneeded = async () => {
      // Create an offer
      const offer = await pc.createOffer();
      // Set localDescription
      send();

      await pc.setLocalDescription(offer);
      // Send an offer to otherside
      socket.send(
        JSON.stringify({ type: "createOffer", sdp: pc.localDescription })
      );
    };

    // Add new Ice candidate
    pc.onicecandidate = (e) => {
      console.log(e);
      if (e.candidate) {
        socket?.send(
          JSON.stringify({ type: "iceCandidate", candidate: e.candidate })
        );
      }
    };

    //

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // If receive the answer
      if (data.type === "createAnswer") {
        // set the remote description
        pc.setRemoteDescription(data.sdp);
        // trickel ice (adding new ice candidate to pc object)
      } else if (data.type === "iceCandidate") {
        pc.addIceCandidate(data.candidate);
      }
    };

    // navigator.geolocation.getCurrentPosition() //==> for current location

    // // To access screenShare from user
    // const stream = await navigator.mediaDevices.getDisplayMedia({
    //   video: true,
    //   audio: false,
    // });

    // To access video from user
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    // To send video data
    pc.addTrack(stream.getVideoTracks()[0]); // if video is true
    // pc.addTrack(stream.getAudioTracks()[0]); // if audio is true

    // To see the video of your own
    const video = document.createElement("video");
    document.body.appendChild(video);
    video.srcObject = stream;
    video.play();
  }
  return (
    <div>
      Sender
      <button onClick={startSendingVideo}>Send Video</button>
    </div>
  );
}
