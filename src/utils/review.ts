export interface OrderItem {
  orderId: string;
  orderDate: string;
  type: 'food' | 'combo';
  item: {
    id: string;
    name: string;
    image: string;
    price: string;
  };
  quantity: number;
  isReviewed: boolean;
  reviewId: string | null;
}

export interface ReviewListResponse {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: OrderItem[];
}

export interface ReviewDetail {
  id: string;
  userId: string;
  foodId: string | null;
  comboId: string | null;
  orderId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  foodName?: string;
  foodImage?: string;
  userName: string;
  userAvatar: string;
  canEdit: boolean;
}

export interface CreateReviewRequest {
  orderId: string;
  foodId?: string;
  comboId?: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}
