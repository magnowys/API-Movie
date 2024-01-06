const knex = require('../database/knex');

class MovieController {
    async create(request, response) {
        const { title, description, rating, tags } = request.body;
        const user_id = request.user.id;

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

        return response.status(200).json();
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
                .innerJoin("movie", "movie.id", "tags.movie_id")
                .groupBy("movie.id")
                .orderBy("movie.title")

        } else {
            movie = await knex("movie")
                .where({ user_id })
                .whereLike("title", `%${title}%`)
                .orderBy("title");
        }

        const userTags = await knex("tags").where({ user_id });
        const movieWithTags = movie.map(movie => {
            const movieTags = userTags.filter(tag => tag.movie_id === movie.id);

            return {
                ...movie,
                tags: movieTags
            }
        });

        return response.json(movieWithTags);
    }
    
}

module.exports = MovieController