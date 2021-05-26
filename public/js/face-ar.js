// Handling all of our errors here by alerting them
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
let myProfile;
let people =0;
// require("dotenv").config();
// const OpenTok = require("opentok");
// const opentok = new OpenTok(
//   process.env.OPENTOK_API_KEY,
//   process.env.OPENTOK_API_SECRET
// );
const socket = io("/");
let currentUserId;
socket.on("connect", function () {
  currentUserId = socket.id;
});
let pendingMsg = 0;

document.addEventListener("keydown", (e) => {
  if (e.which === 13 && chatInputBox.value != "" && filterString(chatInputBox.value)) {
    socket.emit("client message", {
      msg: chatInputBox.value,
      user: currentUserId,
      roomId: ROOM_ID,
    });
    chatInputBox.value = "";
  }
});

document.querySelector(".sendMsg").addEventListener("click", (e) => {
  
  if (chatInputBox.value != "" && filterString(chatInputBox.value)) {
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
  if(filterString(message.msg)){
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

///

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
  let YokList = new Array('나쁜놈','바보','섹스','씹','니애미','엠창','개새끼','개색기','개색끼','개자식','개보지','개자지','개년','개걸래','개걸레',
                          '새끼야','씨발','씨팔','씨부랄','씨바랄','씹창','씹탱','씹보지','씨벌탱','씹자지','씨방세','씨방새','씨펄',
                          '시펄','십탱','씨박','썅','쌍놈','쌍넘','싸가지','쓰벌','씁얼','상넘이','상놈의','상놈이','상놈을','좆','좃',
                          '존나게','존만한','같은년','넣을년','버릴년','부랄년','뒤져라','바랄년','미친년','니기미','니미씹','니미씨',"니미 씨벌",
                          '니미럴','니미랄','호로','후레아들','호로새끼','후레자식','후래자식','후라들년','후라들넘','빠구리','병신','죽어라');
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

let userId;
// video_sessionId ='2_MX40NzIwNTYyNH5-MTYyMTQ1OTkwOTUxMX4zSlVxem9ySHFlUjZkK2xMdE9zVENrd2h-fg'
// video_apiKey = process.env.OPENTOK_API_KEY;
// video_token = 'T1==cGFydG5lcl9pZD00NzIwNTYyNCZzaWc9MTgwNzEwYWY4NDRhZjY4NjliNjhmMjlhNzNjMzAxNjUzNzg2NjFkNDpzZXNzaW9uX2lkPTJfTVg0ME56SXdOVFl5Tkg1LU1UWXlNVFExT1Rrd09UVXhNWDR6U2xWeGVtOXlTSEZsVWpaa0syeE1kRTl6VkVOcmQyaC1mZyZjcmVhdGVfdGltZT0xNjIxNDYwODE2Jm5vbmNlPTAuMzg4NTUxNzkwODY5MTU0MDMmcm9sZT1tb2RlcmF0b3ImZXhwaXJlX3RpbWU9MTYyNDA1MjgxNSZpbml0aWFsX2xheW91dF9jbGFzc19saXN0PQ=='
// deepAR_license_key = process.env.DEEPAR_KEY;
fetch("/api/video")
  .then(async (response) => {
    const { apiKey, sessionId, token, deepARKey } = await response.json();
    video_apiKey = apiKey;
    video_sessionId = sessionId;
    video_token = token;
    deepAR_license_key = deepARKey;
    initDeepAR();
    recognition.start();
    initializeSession(video_apiKey, video_sessionId);
  })
  .catch((err) => console.log(err));




function initializeSession(video_apiKey, video_sessionId) {
  // const users =document.querySelector('.user-wrapper')
  var session = OT.initSession(video_apiKey, video_sessionId);
  
  // Subscribe to a newly created stream
  
  session.on("streamCreated", function (event) {
    console.log('streamCreated')
    people++;
    // const member = document.createElement('li')zz
    // const userName =decodeURIComponent(document.cookie).split(';');
    // console.log(userName)
    // member.innerHTML = `<span class="avatar"><img src="/image/happy.png"></span>`
    // myProfile = member;
    // users.append(member);
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
  console.log('publisher')
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


///
