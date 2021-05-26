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

let text;
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition();

recognition.interimResults = true;
recognition.addEventListener('result',(e)=>{
  text = Array.from(e.results)
  .map(result => result[0])
  .map(result => result.transcript)
  .join('');
  if(e.results[0].isFinal){
    filterString(text.replace(/(\s*)/g, ""))
  }
})

function filterString(text) {
  let YokList = new Array('나쁜놈','바보','섹스','씹','니애미','엠창','개새끼','개색기','개색끼','개자식','개보지','개자지','개년','개걸래','개걸레','새끼야','씨발','씨팔','씨부랄','씨바랄','씹창','씹탱','씹보지','씨벌탱','씹자지','씨방세','씨방새','씨펄','시펄','십탱','씨박','썅','쌍놈','쌍넘','싸가지','쓰벌','씁얼','상넘이','상놈의','상놈이','상놈을','좆','좃','존나게','존만한','같은년','넣을년','버릴년','부랄년','뒤져라','바랄년','미친년','니기미','니미씹','니미씨',"니미 씨벌",'니미럴','니미랄','호로','후레아들','호로새끼','후레자식','후래자식','후라들년','후라들넘','빠구리','병신','죽어라');
  for (var n = 0; n < YokList.length; n++) {
    if (text.includes(YokList[n])) {
      alert('부적절한 언행으로 인해 신고 조치 되셨습니다. 화상채팅을 종료합니다.');
      window.open('', '_self', '');
      window.close();
      return false;
    }
  }
  return true;
}


recognition.addEventListener('end',()=>{
  recognition.start();
})




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
    recognition.start();
    

    myPeer.on("call", (call) => {
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
      if (e.which === 13 && chatInputBox.value != "" && filterString(chatInputBox.value)) {
        socket.emit("message", {
          msg: chatInputBox.value,
          user: currentUserId,
        });
        chatInputBox.value = "";
      }
    });

    document.querySelector(".sendMsg").addEventListener("click", (e) => {
      if (chatInputBox.value != "" && filterString(chatInputBox.value)) {
        socket.emit("message", {
          msg: chatInputBox.value,
          user: currentUserId,
        }),
          (chatInputBox.value = "");
      }
    });

    document.getElementById("muteButton").addEventListener("click", (e) => {
      muteUnmute();
    });
    document.getElementById("playPauseVideo").addEventListener("click", (e) => {
      playStop();
    });

    // chatInputBox.addEventListener("focus", () => {
    //   console.log("focus on");
    //   document.getElementById("chat__Btn").classList.remove("has__new");
    //   pendingMsg = 0;
    //   document.getElementById("chat__Btn").children[1].innerHTML = "Chat";
    // });

    socket.on("createMessage", (message) => {
      let li = document.createElement("li");
      if(filterString(message.msg)){
        if (message.user != currentUserId) {
          li.classList.add("otherUser");
          li.innerHTML = `<div><b>익명이</b>${message.msg}</div>`;
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
});

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
    socket.emit("leave-room", ROOM_ID, currentUserId);
  }
});

const connectToNewUser = (userId, streams) => {
  var call = myPeer.call(userId, streams);
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
  videoGrid.append(video);
  video.enabled = true;

  if (who === "me") {
    // video.addEventListener("play", () => {
    //   if (document.querySelector("canvas")) {
    //     document.querySelector("canvas").remove();
    //   }
    //   const canvas = faceapi.createCanvasFromMedia(video);
    //   videoGrid.append(canvas);
    //   const displaySize = {
    //     width: video.clientWidth ,
    //     height: video.clientHeight,
    //   };
    //   faceapi.matchDimensions(canvas, displaySize);
    //   setInterval(async () => {
    //     const detections = await faceapi
    //       .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    //       .withFaceLandmarks()
    //       .withFaceExpressions();
    //     const resizedDetections = faceapi.resizeResults(
    //       detections,
    //       displaySize
    //     );
    //     if(resizedDetections && resizedDetections[0]){
    //       const arr = resizedDetections[0].expressions;
    //       const emotion = Object.keys(arr).sort(function (a, b) {
    //         return -arr[a] + arr[b];
    //       });
    //       varEmotion[emotion[0]] += 1;
    //     }
    //     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    //     faceapi.draw.drawDetections(canvas, resizedDetections);
    //     faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    //     faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    //   }, 100);
    // });
  }
}



const popup = document.querySelector('.popup-wrapper')
const exitBtn = document.querySelector('.exit-room');
const exitCancle = document.querySelector('.exit-canlce-btn');
const exit = document.querySelector('.exit-btn')
exitBtn.addEventListener('click',()=>{
  popup.classList.add('popup-show')
})

exitCancle.addEventListener('click',()=>{
  popup.classList.remove('popup-show')

})

exit.addEventListener('click', ()=> {
  window.open('', '_self', '');
  window.close();

})



const warning = document.querySelector('.warning-for-landsacpe')
window.addEventListener('resize', function () {
	if (window.matchMedia('(orientation: portrait)').matches) {
    warning.classList.add('warning-show')
      // Portrait 모드일 때 실행할 스크립트
      // 폭과 높이가 같으면 Portrait 모드로 인식돼요
    } else {
      warning.classList.remove('warning-show')
      // Landscape 모드일 때 실행할 스크립트
    }
});