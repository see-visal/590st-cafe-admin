export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  status: string;
  method: string;
}
