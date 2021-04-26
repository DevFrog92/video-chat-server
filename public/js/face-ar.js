// Handling all of our errors here by alerting them
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");

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

document.getElementById("sendMsg").addEventListener("click", (e) => {
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
    li.innerHTML = `<div><b>User (<small>${message.user}</small>: </b>${message.msg}</div>`;
  } else {
    li.innerHTML = `<div><b>Me : </b>${message.msg}</div>`;
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
console.log("running");

let video_apiKey;
let video_sessionId;
let video_token;
let deepAR_license_key;

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
    console.log("vidoe_apikey", video_apiKey);
    initDeepAR();
    initializeSession(video_apiKey, video_sessionId);
  })
  .catch((err) => console.log(err));

function initializeSession(video_apiKey, video_sessionId) {
  var session = OT.initSession(video_apiKey, video_sessionId);

  // Subscribe to a newly created stream
  session.on("streamCreated", function (event) {
    session.subscribe(
      event.stream,
      "subscriber",
      {
        insertMode: "append",
        width: "100%",
        height: "100%",
      },
      handleError
    );
  });
  // Create a publisher
  var publisher = OT.initPublisher(
    "publisher",
    {
      insertMode: "append",
      width: "100%",
      height: "100%",
      videoSource: videoTracks[0],
    },
    handleError
  );

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
