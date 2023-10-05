const express = require("express");
const bcrypt = require("bcryptjs");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { Spot, Review, SpotImage } = require("../../db/models");

const router = express.Router();

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const validators = require("../../utils/routevalidator");

const Sequelize = require("sequelize");

//Delete an Image for a Spot
router.delete("/:imageId",requireAuth, validators.checkExist, 
validators.checkOwner, async (req, res, next) => {

    const deleteImg = await SpotImage.findByPk(req.params.imageId);
    await deleteImg.destroy();
    res.json({ message: "Successfully deleted" });
  }
);

module.exports = router;
