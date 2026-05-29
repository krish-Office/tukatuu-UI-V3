import { Order } from "./types";

export const getStoredOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("greenmart_orders");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse orders", e);
      return [];
    }
  }
  return [];
};

export const saveOrder = (order: Order) => {
  if (typeof window === "undefined") return;
  const currentOrders = getStoredOrders();
  const newOrders = [order, ...currentOrders];
  localStorage.setItem("greenmart_orders", JSON.stringify(newOrders));
  return newOrders;
};
