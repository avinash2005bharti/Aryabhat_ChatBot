const express = require("express");
const router = express.Router();

const settingsController =
require("../controllers/settings.control");

const authMiddleware =
require("../middlewares/auth.middleware");

router.get(
    "/profile",
    authMiddleware.authUser,
    settingsController.getProfile
);

router.put(
    "/update-name",
    authMiddleware.authUser,
    settingsController.updateName
);

router.put(
    "/update-avatar",
    authMiddleware.authUser,
    settingsController.updateAvatar
);

router.put(
    "/change-password",
    authMiddleware.authUser,
    settingsController.changePassword
);

module.exports = router;