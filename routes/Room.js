const express = require("express");
const router = express.Router();

router.get("/:roomId", (_, res) => {
  res.render(
    "room/room.ejs",
    { message: "hello" } // message 란 변수를 템플릿으로 내보낸다.
  );
});

router.get("/ar/:roomId", (_, res) => {
  res.render(
    "room/RolePlaying.ejs",
    { message: "hello" } // message 란 변수를 템플릿으로 내보낸다.
  );
});

module.exports = router;
