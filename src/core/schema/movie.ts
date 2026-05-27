import { z } from "zod";

export const ratingSchema = z.object({
  user: z.string(),
  score: z.number().min(1).max(5),
});

export const categorySchema = z.enum(["Action", "Sci-Fi", "Horror", "Comedy", "Thriller", "Drama", "Romance", "Adventure", "Fantasy", "Animation", "Biography", "Documentary", "Family", "Music", "Mystery", "Sport", "Western"]);
export const ageRatingSchema = z.enum(["G", "PG", "PG-13", "NC-17", "R"]);

export const movieSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: categorySchema,
  thumbnail: z.unknown(),
  youtubeUrl: z.string().url("Must be a valid URL"),
  views: z.number().nonnegative(),
  ratings: z.string(),
  year: z.number().int().min(1900).max(2100),
  matchRate: z.number().min(0).max(100),
  ageRating: ageRatingSchema,
  duration: z.number().min(1, "Duration is required"),
});

export const updateMovieSchema = movieSchema.omit({
  id: true,
  views: true,
  ratings: true,
});

export const createMovieSchema = movieSchema.omit({
  id: true,
  views: true,
  ratings: true,
});
