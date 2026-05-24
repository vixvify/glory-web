import { Rating } from "./rating";

export interface Movie {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  youtubeUrl: string;
  views: number;
  ratings: Rating[];
  year: number;
  matchRate: number;
  ageRating: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovie {
  title: string;
  description: string;
  category: string;
  thumbnail: File;
  youtubeUrl: string;
  year: number;
  matchRate: number;
  ageRating: string;
  duration: number;
}

export interface UpdateMovie {
  title: string;
  description: string;
  category: string;
  thumbnail: File | string;
  youtubeUrl: string;
  year: number;
  matchRate: number;
  ageRating: string;
  duration: number;
}

