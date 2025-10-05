// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  key?: string;
  data?: T;
  info?: any;
}

// Pagination
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Multi-language content
export interface MultiLanguageContent {
  ar: string;
  en: string;
}

// User types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email?: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  phone_verified: boolean;
  avatar?: string;
  avatar_url?: string;
  language?: string;
  wallet_balance: number;
  notifications_unread_count: number;
  listings_count: number;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface LoginRequest {
  phone: string;
  password: string;
  role: 'user' | 'admin';
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirmation: string;
  avatar?: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  data: User;
}

// Location types
export interface Governorate {
  id: number;
  name: MultiLanguageContent;
  code?: string;
  orders?: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  governorate_id: number;
  name: MultiLanguageContent;
  place_id?: string;
  orders?: number;
  availability: boolean;
  created_at: string;
  updated_at: string;
  governorate?: Governorate;
}

// Category types
export interface Category {
  id: number;
  name: MultiLanguageContent;
  description?: MultiLanguageContent;
  icon: string;
  properties_source: 'custom' | 'parent' | 'parent_and_custom';
  parent_id?: number;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
  properties?: Property[];
  features?: Feature[];
}

// Property types
export interface Property {
  id: number;
  category_id: number;
  name: MultiLanguageContent;
  description?: MultiLanguageContent;
  icon: string;
  type: 'int' | 'float' | 'bool' | 'datetime' | 'enum';
  options?: string[];
  sort_order: number;
  is_filter: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Feature types
export interface Feature {
  id: number;
  category_id: number;
  name: MultiLanguageContent;
  description?: MultiLanguageContent;
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// Media types
export interface Media {
  id: number;
  type: 'image' | 'video';
  url: string;
  source: 'file' | 'link';
  sort_order: number;
  imageable_id: number;
  imageable_type: string;
  created_at: string;
  updated_at: string;
}

// Listing types
export interface Listing {
  id: number;
  owner_id: number;
  category_id: number;
  title: MultiLanguageContent;
  ribon_text?: string;
  ribon_color: string;
  description?: MultiLanguageContent;
  price: number;
  currency: string;
  governorate_id: number;
  city_id?: number;
  latitude?: string;
  longitude?: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  availability_status: 'available' | 'unavailable' | 'rented' | 'sold';
  available_from?: string;
  available_until?: string;
  type: 'rent' | 'sale';
  pay_every?: number;
  insurance?: number;
  is_featured: boolean;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  owner?: User;
  category?: Category;
  governorate?: Governorate;
  city?: City;
  properties?: ListingProperty[];
  features?: ListingFeature[];
  media?: Media[];
  reviews?: Review[];
  average_rating?: number;
  reviews_count?: number;
}

export interface ListingProperty {
  id: number;
  listing_id: number;
  property_id: number;
  value: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface ListingFeature {
  id: number;
  listing_id: number;
  feature_id: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  feature?: Feature;
}

// Review types
export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  user?: User;
}

// Notification types
export interface Notification {
  id: number;
  user_id?: number;
  title: MultiLanguageContent;
  message: MultiLanguageContent;
  notificationable_id?: number;
  notificationable_type?: string;
  read_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Slider types
export interface Slider {
  id: number;
  user_id: number;
  image_url: string;
  target_url?: string;
  start_at: string;
  end_at: string;
  active: boolean;
  clicks: number;
  created_at: string;
  updated_at: string;
}

// Settings types
export interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'int' | 'float' | 'text' | 'long_text' | 'json' | 'bool' | 'datetime' | 'html';
  is_settings: boolean;
  created_at: string;
  updated_at: string;
}

// Search and filter types
export interface ListingFilters {
  page?: number;
  per_page?: number;
  category_id?: number;
  city_id?: number;
  governorate_id?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
  type?: 'rent' | 'sale';
  status?: string;
  availability_status?: string;
  features?: number[];
  properties?: Record<string, any>;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Form types
export interface CreateListingRequest {
  title: MultiLanguageContent;
  description: MultiLanguageContent;
  category_id: number;
  governorate_id: number;
  city_id?: number;
  price: number;
  currency: string;
  latitude?: string;
  longitude?: string;
  type: 'rent' | 'sale';
  availability_status: 'available' | 'unavailable' | 'rented' | 'sold';
  status: 'draft' | 'in_review';
  properties: Array<{
    property_id: number;
    value: string;
    sort_order: number;
  }>;
  features: number[];
  media: Array<{
    type: 'image' | 'video';
    url: string;
    source: 'file' | 'link';
    sort_order: number;
  }>;
}

export interface UpdateListingRequest extends Partial<CreateListingRequest> {}

export interface CreateReviewRequest {
  listing_id: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}
