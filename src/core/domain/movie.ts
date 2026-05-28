import { Rating } from "./rating";

export interface MovieCrew {
  id: string;
  movieId: string;
  director?: string | null;
  producer?: string | null;
  writer?: string | null;
  cast: string[];
  btsVideo?: string | null;
  btsPhotos: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
  university?: string | null;
  crew?: MovieCrew | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovie {
  title: string;
  description: string;
  category: string;
  thumbnail: File | null;
  youtubeUrl: string;
  year: number;
  matchRate: number;
  ageRating: string;
  duration: number;
  university?: string;
  director?: string;
  producer?: string;
  writer?: string;
  cast?: string;
  btsVideo?: string;
  btsPhotos?: string;
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
  university?: string | null;
  director?: string | null;
  producer?: string | null;
  writer?: string | null;
  cast?: string | null;
  btsVideo?: string | null;
  btsPhotos?: string | null;
}


