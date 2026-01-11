export interface DashboardData {
    notifications: UserNotification[];
    users: RecentUser[];
    listingsPublished: Listing[];
    listingsPending: Listing[];
    reviews: Review[];
    counts: DashboardCounts;
    graph: DashboardGraph;
    view: DashboardViews;
}

export interface UserNotification {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}

export interface RecentUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinedAt: string;
    status: 'active' | 'inactive' | 'suspended';
}

export interface Listing {
    id: string;
    title: string;
    location: string;
    price: number;
    currency: string;
    status: 'published' | 'pending' | 'draft' | 'rejected';
    publishedAt?: string;
    thumbnail?: string;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    listingId: string;
    listingTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface DashboardCounts {
    listingsAll: number;
    listingsPublished: number;
    listingsDraft: number; // Fixed typo: listongsDraft
    users: number; // Active users count or total?
    reviews: number;
    sliders: number;
    categories: number;
    features: number;
    locations: number; // Renamed from 'government'
    reviewsAverage: number; // Fixed typo: reviewsAvarge
}

export interface DashboardGraph {
    listings: GraphPoint[];
    users: GraphPoint[];
    reviews: GraphPoint[];
}

export interface GraphPoint {
    month: string;
    count: number;
}

export interface DashboardViews {
    // Add specific view stats if needed, e.g. totalViews, uniqueVisitors
    totalViews?: number;
    dailyViews?: GraphPoint[];
}
