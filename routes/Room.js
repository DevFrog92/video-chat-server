const express = require("express");
const router = express.Router();

router.get("/:roomId", (_, res) => {
  res.render(
    "room/room.ejs",
  );
});

router.get("/ar/:roomId", (_, res) => {
  res.render(
    "room/RolePlaying.ejs",
  );
});
router.get("/secret/:roomId", (_, res) => {
  res.render(
    "room/complain.ejs",
  );
});

module.exports = router;
