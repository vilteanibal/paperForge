export interface LandingFeature {
    id: number;
    icon: string;
    title: string;
    description: string;
    sort_order: number;
}

export interface LandingPricingTier {
    id: number;
    name: string;
    price: number | string;
    billing_period: string;
    features: string[];
    is_highlighted: boolean;
    cta_label: string;
    sort_order: number;
}
