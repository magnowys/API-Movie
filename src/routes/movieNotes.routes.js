const { Router } = require("express");

const MovieNotesController = require("../controllers/MovieNotesController");

const movieNotesRoutes = Router();

const movieNotesController = new MovieNotesController();

function isRatingValid (request, response, next) {
    const {rating} = request.body
    
    if (Number.isInteger(rating) && rating >= 0 && rating <= 5) {
        return next();
    } else {
    return response.status(400).json({ error: "Rating must be between 0 and 5" });
    }
}

movieNotesRoutes.get("/", movieNotesController.index);
movieNotesRoutes.post("/:user_id", isRatingValid, movieNotesController.create);
movieNotesRoutes.get("/:id", movieNotesController.show);
movieNotesRoutes.delete("/:id", movieNotesController.delete);

module.exports = movieNotesRoutes;