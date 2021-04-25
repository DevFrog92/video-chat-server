const socket = io("/");
const videoGrid = document.querySelector("#video-grid");
const myVideo = document.createElement("video");
let peers = {};

// const myPeer = new Peer(undefined, {
//   host: "/",
//   port: "3001",
// });

// peerjs config

var myPeer = new Peer({
  port: 443,
  config: {
    iceServers: [
      {
        url: "turn:numb.viagenie.ca",
        credential: "muazkh",
        username: "webrtc@live.com",
      },
      {
        url: "turn:192.158.29.39:3478?transport=udp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
      {
        url: "turn:192.158.29.39:3478?transport=tcp",
        credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
        username: "28224511:1379330808",
      },
      {
        url: "turn:turn.bistri.com:80",
        credential: "homeo",
        username: "homeo",
      },
      {
        url: "turn:turn.anyfirewall.com:433?transport=tcp",
        credential: "webrtc",
        username: "webrtc",
      },
      {
        url: ["turn:13.250.13.83:3478?transport=tcp"],
        credential: "YzYNCouZM1mhqhmseWk6",
        username: "YzYNCouZM1mhqhmseWk6",
      },
    ],
  },
});

myVideo.muted = true;

var getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // my video
    addVideoStream(myVideo, stream);

    myPeer.on("call", (call) => {
      console.log("calling");
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
        console.log(peers);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

myPeer.on("call", function (call) {
  getUserMedia({ video: true, audio: true }, function (stream) {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", function (remoteStream) {
      addVideoStream(video, remoteStream);
    });
  });
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User connectd :" + userId);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  console.log("this is call ");
  const video = document.createElement("video");

  call.on("stream", (remoteStream) => {
    addVideoStream(video, remoteStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  console.log("add video stream");
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  console.log("video attached");
  videoGrid.append(video);
}
