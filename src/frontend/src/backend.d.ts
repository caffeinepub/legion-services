import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Service {
    id: bigint;
    name: string;
    acceptedPayments: Array<PaymentType>;
    description: string;
    available: boolean;
    category: ServiceCategory;
    priceUSD: number;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    contactInfo: string;
    paymentMethod: PaymentType;
    notes: string;
    quantity: bigint;
    serviceId: bigint;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    inProgress = "inProgress"
}
export enum PaymentType {
    money = "money",
    inGameFruits = "inGameFruits",
    crypto = "crypto"
}
export enum ServiceCategory {
    discordServices = "discordServices",
    bloxFruits = "bloxFruits"
}
export interface backendInterface {
    getAllOrders(): Promise<Array<Order>>;
    getAllServices(): Promise<Array<Service>>;
    getAvailableServices(): Promise<Array<Service>>;
    getOrder(id: bigint): Promise<Order>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<Order>>;
    getService(id: bigint): Promise<Service>;
    getServicesByCategory(category: ServiceCategory): Promise<Array<Service>>;
    submitOrder(serviceId: bigint, quantity: bigint, paymentMethod: PaymentType, contactInfo: string, notes: string): Promise<bigint>;
    updateOrderStatus(orderId: bigint, newStatus: OrderStatus): Promise<void>;
}
