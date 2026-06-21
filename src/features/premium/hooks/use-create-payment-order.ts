"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient, endpoints } from "@/api";

type CreateOrderPayload = {
  guildId: string;
  plan: string;
};

type CreateOrderResult = {
  orderId: string;
  checkoutUrl: string;
};

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
      const { data } = await apiClient.post(endpoints.payment.createOrder, payload);
      const result = (data as { data: unknown }).data as CreateOrderResult;
      return result;
    },
  });
}
