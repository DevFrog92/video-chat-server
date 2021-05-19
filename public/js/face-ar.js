// Handling all of our errors here by alerting them
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
let myProfile;
let people =0;
const socket = io("/");
let currentUserId;
socket.on("connect", function () {
  currentUserId = socket.id;
});
let pendingMsg = 0;

document.addEventListener("keydown", (e) => {
  console.log("key down");
  if (e.which === 13 && chatInputBox.value != "") {
    console.log("보낻ㄴ다 endter", chatInputBox.value);
    socket.emit("client message", {
      msg: chatInputBox.value,
      user: currentUserId,
      roomId: ROOM_ID,
    });
    chatInputBox.value = "";
  }
});

document.querySelector(".sendMsg").addEventListener("click", (e) => {
  console.log("clicked");
  if (chatInputBox.value != "") {
    console.log("보낸다");
    socket.emit("client message", {
      msg: chatInputBox.value,
      user: currentUserId,
      roomId: ROOM_ID,
    }),
      (chatInputBox.value = "");
  }
});

// chatInputBox.addEventListener("focus", () => {
//   console.log("focus on");
//   document.getElementById("chat__Btn").classList.remove("has__new");
//   pendingMsg = 0;
//   document.getElementById("chat__Btn").children[1].innerHTML = "Chat";
// });

socket.on("client createMessage", (message) => {
  console.log("message", message);
  let li = document.createElement("li");
  if (message.user != currentUserId) {
    li.classList.add("otherUser");
    // li.innerHTML = `<div><b>익명이<small>${message.user}</small>: </b>${message.msg}</div>`;
    li.innerHTML = `<div><b>익명이</b><br>${message.msg}</div>`;
  } else {
    li.classList.add("me");
    li.innerHTML = `<div><b>나</b><br>${message.msg}</div>`;
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

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

let video_apiKey;
let video_sessionId;
let video_token;
let deepAR_license_key;
let publisher;
let deepAR;

const canvas = document.createElement("canvas");
// const canvas = document.querySelector("canvas");
const mediaStream = canvas.captureStream(25);
const videoTracks = mediaStream.getVideoTracks();

fetch("/api/video")
  .then(async (response) => {
    const { apiKey, sessionId, token, deepARKey } = await response.json();
    video_apiKey = apiKey;
    video_sessionId = sessionId;
    video_token = token;
    deepAR_license_key = deepARKey;
    initDeepAR();
    initializeSession(video_apiKey, video_sessionId);
  })
  .catch((err) => console.log(err));

function initializeSession(video_apiKey, video_sessionId) {
  // const users =document.querySelector('.user-wrapper')
  var session = OT.initSession(video_apiKey, video_sessionId);
  
  // Subscribe to a newly created stream
  
  session.on("streamCreated", function (event) {
    
    people++;
    // const member = document.createElement('li')
    // const userName =decodeURIComponent(document.cookie).split(';');
    // console.log(userName)
    // member.innerHTML = `<span class="avatar"><img src="/image/happy.png"></span>`
    // myProfile = member;
    // users.append(member);
    console.log('stream Created',people)
    session.subscribe(
      event.stream,
      `subscriber${people}`,
      {
        insertMode: "append",
        width: "100%",
        height: "100%",
      },
      handleError
    );
  });
  // Create a publisher
  publisher = OT.initPublisher(
    "publisher",
    {
      insertMode: "append",
      width: "100%",
      height: "100%",
      videoSource: videoTracks[0],
    },
    handleError
  );
  publisher.publishVideo(false);
  publisher.publishAudio(false);

  // Connect to the session
  session.connect(video_token, function (error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });
}

function initDeepAR() {
  //
  deepAR = DeepAR({
    licenseKey: deepAR_license_key,
    canvasWidth: window.innerWidth,
    canvasHeight: window.innerHeight,
    canvas,
    numberOfFaces: 1, // how many faces we want to track min 1, max 4
    onInitialize: function () {
      // start video immediately after the initalization, mirror = true
      deepAR.startVideo(true);
      // load the aviators effect on the first face into slot 'slot'
      switchARFilter("alien");
    },
  });
  deepAR.downloadFaceTrackingModel("/models/models-68-extreme.bin");
}

function switchARFilter(effect) {
  deepAR.switchEffect(0, "slot", `/effects/${effect}`, function () {
    // effect loaded
  });
}

const effectsSelect = document.querySelector("#effects");

effectsSelect.addEventListener("change", (event) => {
  console.log(event);
  switchARFilter(event.target.value);
});


const videos = document.querySelector('.video_show');
const audios = document.querySelector('.silence');
videos.addEventListener('click',(e)=>{
  const offair = document.querySelector('.offair');
  const onair = document.querySelector('.onair');

  if(e.target.classList.contains('offair')){
    // stopVideo(publisher_video)
    offair.classList.add('hide');
    onair.classList.remove('hide');
    publisher.publishVideo(false);
  }else {
    offair.classList.remove('hide');
    onair.classList.add('hide');
    publisher.publishVideo(true);
  }
})

audios.addEventListener('click',(e)=>{
const audio_btn = document.querySelector('.OT_mute');
const audio_level_meter = document.querySelector('.OT_audio-level-meter');
const mute = document.querySelector('.mute');
const unmute = document.querySelector('.unmute');
  if(e.target.classList.contains('mute')){
    // stopVideo(publisher_video)
    mute.classList.add('hide');
    unmute.classList.remove('hide');
    publisher.publishAudio(false);
    audio_btn.classList.add('OT_active');
    audio_level_meter.classList.add('OT_hide-forced');
  }else {
    mute.classList.remove('hide');
    unmute.classList.add('hide');
    publisher.publishAudio(true);
    audio_btn.classList.remove('OT_active');
    audio_level_meter.classList.remove('OT_hide-forced');
  }
})


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

if (window.matchMedia('(orientation: portrait)').matches) {
  console.log('세로야 임마!')

		// Portrait 모드일 때 실행할 스크립트
		// 폭과 높이가 같으면 Portrait 모드로 인식돼요
	} else {
		// Landscape 모드일 때 실행할 스크립트
  console.log('가로 모드로 돌리기')

	}

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