import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./use-user";
import { Subscription } from "@/lib/generated/prisma";

export function useSubscription() {
  const user = useUser();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;

      const response = await fetch(`/api/subscription?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
    },
  });

  const isActive = subscription?.status === "ACTIVE";
  const currentTier = subscription?.tier || "FREE";
  const isPremium = currentTier === "PREMIUM" || currentTier === "MAX";
  const isMax = currentTier === "MAX";

  return {
    subscription,
    isLoading,
    error,
    isActive,
    currentTier,
    isPremium,
    isMax,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCanceling: cancelSubscriptionMutation.isPending,
  };
}
