const { Router } = require("express");

const MovieTagsController = require("../controllers/MovieTagsController");

const movietagsRoutes = Router();

const movietagsController = new MovieTagsController();

movietagsRoutes.get("/:id", movietagsController.index);

module.exports = movietagsRoutes;