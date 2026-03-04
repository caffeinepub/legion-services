import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Order,
  OrderStatus,
  PaymentType,
  type Service,
  ServiceCategory,
} from "../backend.d";
import { useActor } from "./useActor";

export { PaymentType, ServiceCategory, OrderStatus };
export type { Service, Order };

export function useAvailableServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["availableServices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["allServices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      quantity,
      paymentMethod,
      contactInfo,
      notes,
    }: {
      serviceId: bigint;
      quantity: bigint;
      paymentMethod: PaymentType;
      contactInfo: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.submitOrder(
        serviceId,
        quantity,
        paymentMethod,
        contactInfo,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availableServices"] });
    },
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newStatus,
    }: {
      orderId: bigint;
      newStatus: OrderStatus;
    }) => {
      if (!actor) throw new Error("No actor available");
      return actor.updateOrderStatus(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useGetOrder(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Order>({
    queryKey: ["order", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getOrder(id);
    },
    enabled: !!actor && !isFetching && id !== null,
    retry: false,
  });
}

export function useGetService(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Service>({
    queryKey: ["service", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getService(id);
    },
    enabled: !!actor && !isFetching && id !== null,
    retry: false,
  });
}
