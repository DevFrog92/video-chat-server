// document
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]);
const userEmotoin = {};
const varEmotion = {
  angry: 0,
  disgusted: 0,
  fearful: 0,
  happy: 0,
  neutral: 0,
  sad: 0,
  surprised: 0,
};
//
const socket = io("/");
const videoGrid = document.querySelector(".video-grid");
const myVideo = document.createElement("video");
let peers = {};
let users  = 1;

// const myPeer = new Peer(undefined, {
//   host: "/",
//   port: "3001",
// });

// peerjs config

var myPeer = new Peer({
  port: 443,
  config: {
    iceServers: [{   urls: [ "stun:tk-turn2.xirsys.com" ]}, {   username: "3V3-AGNuqTdzS9UZxcrCLiqVS0YA5x6rKTSFfsl7DWMY8bA_C8KQA_fnqEcp2FK2AAAAAGCO1Sx5b25nc3U=",   credential: "9e6f83d0-ab64-11eb-8cd4-0242ac140004",   urls: [       "turn:tk-turn2.xirsys.com:80?transport=udp",       "turn:tk-turn2.xirsys.com:3478?transport=udp",       "turn:tk-turn2.xirsys.com:80?transport=tcp",       "turn:tk-turn2.xirsys.com:3478?transport=tcp",       "turns:tk-turn2.xirsys.com:443?transport=tcp",       "turns:tk-turn2.xirsys.com:5349?transport=tcp"   ]}]
  },
});



myVideo.muted = true;

let myVideoStream;
let currentUserId;
let pendingMsg = 0;

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
    myVideoStream = stream;
    addVideoStream(myVideo, stream, 0, "me");

    myPeer.on("call", (call) => {
      console.log("calling");
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, 0, "me");
      });
    });

    socket.on("user-connected", (userId) => {
      users++;
      connectToNewUser(userId, stream);
    });
    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
    });

    chatInputBox.addEventListener("keydown", (e) => {
      console.log("key down");
      if (e.which === 13 && chatInputBox.value != "") {
        socket.emit("message", {
          msg: chatInputBox.value,
          user: currentUserId,
        });
        chatInputBox.value = "";
      }
    });

    document.querySelector(".sendMsg").addEventListener("click", (e) => {
      console.log("clicked");
      if (chatInputBox.value != "") {
        socket.emit("message", {
          msg: chatInputBox.value,
          user: currentUserId,
        }),
          (chatInputBox.value = "");
      }
    });

    document.getElementById("muteButton").addEventListener("click", (e) => {
      console.log("muteButton");
      muteUnmute();
    });
    document.getElementById("playPauseVideo").addEventListener("click", (e) => {
      console.log("playPauseVideo");
      playStop();
    });

    chatInputBox.addEventListener("focus", () => {
      console.log("focus on");
      document.getElementById("chat__Btn").classList.remove("has__new");
      pendingMsg = 0;
      document.getElementById("chat__Btn").children[1].innerHTML = "Chat";
    });

    socket.on("createMessage", (message) => {
      console.log("message", message);
      let li = document.createElement("li");
      if (message.user != currentUserId) {
        li.classList.add("otherUser");
        li.innerHTML = `<div><b>User (<small>${message.user}</small>: </b>${message.msg}</div>`;
      } else {
        li.classList.add("me");
        li.innerHTML = `<div><b>Me</b><br>${message.msg}</div>`;
      }

      all_messages.append(li);
      main__chat__window.scrollTop = main__chat__window.scrollHeight;
      if (message.user != currentUserId) {
        pendingMsg++;
        // playChatSound();
        // document.getElementById("chat__Btn").classList.add("has__new");
        // document.getElementById(
        //   "chat__Btn"
        // ).children[1].innerHTML = `Chat (${pendingMsg})`;
      }
    });
  });

myPeer.on("call", function (call) {
  getUserMedia({ video: true, audio: true }, function (stream) {
    call.answer(stream);
    const video = document.createElement("video");
    call.on("stream", function (remoteStream) {
      addVideoStream(video, remoteStream, 0, "me");
    });
  });
});

myPeer.on("open", (id) => {
  currentUserId = id;
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-connected", (userId) => {
  console.log("User connectd :" + userId);
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    console.log("disconnetced");
    peers[userId].close();
    socket.emit("leave-room", ROOM_ID, currentUserId);
  }
});

const connectToNewUser = (userId, streams) => {
  var call = myPeer.call(userId, streams);
  console.log("call", call);
  console.log(peers[userId]);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, userId, "other");
  });
  call.on("close", () => {
    users--;
    video.remove();
  });
  peers[userId] = call;
};

const playStop = () => {
  const offair = document.querySelector('.offair');
  const onair = document.querySelector('.onair');

  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    offair.classList.add('hide');
    onair.classList.remove('hide');
    // setPlayVideo();
  } else {
    // setStopVideo();
    offair.classList.remove('hide');
    onair.classList.add('hide');
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const muteUnmute = () => {
  const mute = document.querySelector('.mute');
  const unmute = document.querySelector('.unmute');
  let enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    mute.classList.add('hide');
    unmute.classList.remove('hide');
    // setUnmuteButton();
  } else {
    mute.classList.remove('hide');
    unmute.classList.add('hide');
    // setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

function addVideoStream(video, stream, userId, who) {
  video.srcObject = stream;
  video.id = 'video-live';
  video.addEventListener("loadedmetadata", () => {
    playStop();
    muteUnmute()
    video.play();

    // video.pause();
    // video.currentTime = 0;
  });
  console.log("video attached");
  videoGrid.append(video);
  video.enabled = true;

  console.log(userId, who);
  if (who === "me") {
    video.addEventListener("play", () => {
      if (document.querySelector("canvas")) {
        document.querySelector("canvas").remove();
      }
      const canvas = faceapi.createCanvasFromMedia(video);
      videoGrid.append(canvas);
      const displaySize = {
        width: video.clientWidth ,
        height: video.clientHeight,
      };
      // console.log(displaySize, video.clientWidth);
      faceapi.matchDimensions(canvas, displaySize);
      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );
        if(resizedDetections && resizedDetections[0]){
          const arr = resizedDetections[0].expressions;
          const emotion = Object.keys(arr).sort(function (a, b) {
            return -arr[a] + arr[b];
          });
          varEmotion[emotion[0]] += 1;
        }
        // console.log(varEmotion);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        // console.log(varEmotion);
      }, 100);
    });
  }
}

const setPlayVideo = () => {
  const html = `<i class="unmute fa fa-pause-circle"></i>
  <span class="unmute">Resume Video!</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
  const html = `<i class=" fa fa-video-camera"></i>
  <span class="">Pause Video!</span>`;
  document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class="unmute fa fa-microphone-slash"></i>
  <span class="unmute">Unmute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
  const html = `<i class="fa fa-microphone"></i>
  <span>Mute</span>`;
  document.getElementById("muteButton").innerHTML = html;
};

const ShowChat = (e) => {
  e.classList.toggle("active");
  document.body.classList.toggle("showChat");
};

const showInvitePopup = () => {
  document.body.classList.add("showInvite");
  document.getElementById("roomLink").value = window.location.href;
};

const hideInvitePopup = () => {
  document.body.classList.remove("showInvite");
};

