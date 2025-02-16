
export interface CustomerOrder {
  id: string;
  date: string;
  items: string;
  total: string;
  pointsEarned: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  rewardPoints: number;
  orders: CustomerOrder[];
}
