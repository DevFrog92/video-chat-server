// need express service
const express = require("express");
// running express service
const app = express();

// scoket.io를 위한 서버를 가지고 와야 한다.
const server = require("http").Server(app);

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

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// web page에 연결되었을때 언제나 실행된다.
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit('user-connected',userId)
    socket.broadcast.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`server is running on port : ${port}`));
