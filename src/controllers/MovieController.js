const knex = require('../database/knex');

class MovieController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const user_id = request.user.id;

        if (Number.isInteger(rating) && rating >= 0 && rating <= 5) {
            const [movie_id] = await knex("movie")
                .insert({
                    title,
                    description,
                    rating,
                    user_id
                });

            const tagsInsert = tags.map(name => {
                return {
                    movie_id,
                    name,
                    user_id
                }
            });

            await knex("tags").insert(tagsInsert);

            return response.status(200).json()
        } else {
            return response.status(400).json({ error: "Rating must be between 0 and 5" });
        }
    }

    async show(request, response) {
        const { id } = request.params;

        const movie = await knex("movie").where({ id }).first();
        const tags = await knex("tags").where({ movie_id: id }).orderBy("name");

        return response.json({
            ...movie,
            tags
        });
    }

    async delete(request, response) {
        const { id } = request.params;

        await knex("movie").where({ id }).delete();

        return response.json();
    }

    async index(request, response) {
        const { title, tags } = request.query;

        const user_id = request.user.id;

        let movie;

        if (tags) {
            const filterTags = tags.split(",").map(tag => tag.trim());

            movie = await knex("tags")
                .select([
                    "movie.id",
                    "movie.title",
                    "movie.user_id",
                ])
                .where("movie.user_id", user_id)
                .whereLike("movie.title", `%${title}%`)
                .whereIn("name", filterTags)
                .innerJoin("movie", "movie.id", "tags.note_id")
                .orderBy("notes.title")

        } else {
            movie = await knex("movie")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("title");
        }

        const userTags = await knex("tags").where({ user_id });
        const notesWithTags = movie.map(note => {
            const noteTags = userTags.filter(tag => tag.movie_id === note.id);

            return {
                ...note,
                tags: noteTags
            }
        });

        return response.json(notesWithTags);
    }
}

module.exports = MovieController