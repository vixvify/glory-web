import { z } from "zod";

export const ratingSchema = z.object({
  user: z.string(),
  score: z.number().min(1).max(5),
});

export const movieSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  thumbnail: z.any(),
  youtubeUrl: z.string().url("Must be a valid URL"),
  views: z.number().nonnegative(),
  ratings: z.array(ratingSchema),
  year: z.number().int().min(1900).max(2100),
  matchRate: z.number().min(0).max(100),
  ageRating: z.string().min(1, "Age rating is required"),
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
