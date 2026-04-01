export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  comment: string;
  rating: number;
  date: number;
  helpful?: number;
  notHelpful?: number;
}

export interface CommentCreate {
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  comment: string;
  rating: number;
}

export interface CommentUpdate {
  comment?: string;
  rating?: number;
}

export interface CommentListItem {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  comment: string;
  rating: number;
  date: number;
  helpful?: number;
  notHelpful?: number;
}

export interface ProductRating {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
