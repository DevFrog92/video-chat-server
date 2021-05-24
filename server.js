// need express service
const express = require("express");
// running express service
const app = express();
// scoket.io를 위한 서버를 가지고 와야 한다.
const server = require("http").Server(app);
const cookieParser = require('cookie-parser');
const nunjucks = require("nunjucks");
const bodyParser = require("body-parser");

const sessionstorage = require('sessionstorage');
const room = require("./routes/Room");
const getTheGoods = require("./public/js/video");
let userId ;
nunjucks.configure("template", {
  autoescape: true,
  express: app,
});
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const io = require("socket.io")(server, {
  transports: ["polling", "websocket"],
});

const { v4: uuidV4 } = require("uuid");

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// io.set("transports", ["websocket"]);
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use("/peerjs", peerServer);

app.get("/api/video", async (req, res) => {
  // get a video api key sessionid & token
  const theGoods = await getTheGoods();

  res.status(200).send(theGoods);
});

app.post("/userId",(req,res) =>{
  res.status(200).send(JSON.stringify({userId:userId}));
})

///test
// app.get("/", (req, res) => {
//   console.log(req.query.data)
//   res.redirect("/video_chat");
// });


// app.get("/:room", (req, res) => {
//   res.render("room", { roomId: req.params.room });
// });

///

app.post("/", (req, res) => {
  console.log("abcd in");
  console.log(req.body.roomId);
  console.log(req.body.userId);
  console.log(req.body.roomName);
  res.redirect(`video_chat/room/${req.body.roomId}`);
});


app.post('/ar',(req,res)=>{
  console.log(req.body.roomId);
  console.log(req.body.userId);
  console.log(req.body.roomName);
  userId = req.body.userId;
  res.cookie('userId',req.body.userId);
  sessionstorage.setItem('userNickName',req.body.userId);
  // sessionStorage.setItem('userNickName',req.body.userId);
  // sessionStorage.setItem('roomName',req.body.roomName);
  res.redirect(`video_chat/room/ar/${req.body.roomId}`);
})

app.post("/secret", (req, res) => {
  res.redirect(`video_chat/room/secret/${uuidV4()}`);
});

// app.get("/abcd/ar", (req, res) => {
//   res.render("ar/index.html");
// });

app.use("/video_chat/room", room);

// web page에 연결되었을때 언제나 실행된다.
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    // 룸에 입장했을때
    socket.join(roomId);
    // 나를 제외하고
    socket.broadcast.to(roomId).emit("user-connected", userId);
    // message emit 수신부
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
  socket.on("client message", (message) => {
    io.emit("client createMessage", message);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`server is running on port : ${port}`));
