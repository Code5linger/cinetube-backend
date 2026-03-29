export interface ICreateReviewPayload {
  mediaId: string;
  rating: number | string;
  content: string;
  spoiler?: boolean;
  tags?: unknown;
}

export interface IUpdateReviewPayload {
  rating?: number | string;
  content?: string;
  spoiler?: boolean;
  tags?: unknown;
}

export interface ICreateCommentPayload {
  content: string;
  parentId?: string;
}

export interface IReviewQuery {
  page?: string;
  limit?: string;
  /** recent | top_rated | most_liked */
  sort?: string;
  genre?: string;
  platform?: string;
  minRating?: string;
  maxRating?: string;
  mediaId?: string;
}
