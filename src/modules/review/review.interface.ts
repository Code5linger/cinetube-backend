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
