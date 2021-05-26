const express = require("express");
const router = express.Router();

router.post("/:roomId", (_, res) => {
  res.render(
    "room/room.ejs",
  );
});

router.post("/ar/:roomId", (_, res) => {
  console.log('creates')
  res.render(
    "room/RolePlaying.ejs",
  );
});
router.post("/secret/:roomId", (_, res) => {
  res.render(
    "room/complain.ejs",
  );
});

module.exports = router;
