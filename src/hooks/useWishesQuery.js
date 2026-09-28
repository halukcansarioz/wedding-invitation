import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadPublishedWishesFromDatabase } from '../services/database';
import { supabase } from '../supabaseClient';

export function useWishesQuery() {
  const queryClient = useQueryClient();

  const { data: wishes = [], isLoading, isError } = useQuery({
    queryKey: ['wishes'],
    queryFn: loadPublishedWishesFromDatabase,
  });

  const addWishMutation = useMutation({
    mutationFn: async (newWishData) => {
      const token = navigator.onLine ? newWishData.turnstileToken : "OFFLINE_SYNC";

      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: { 
          type: 'wish', 
          data: {
            name: newWishData.name,
            message: newWishData.message,
            approved: newWishData.approved 
          }, 
          turnstileToken: token 
        }
      });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || "Sunucu hatası.");
      }
      return data.data;
    },
    onMutate: async (newWish) => {
      await queryClient.cancelQueries({ queryKey: ['wishes'] });
      const previousWishes = queryClient.getQueryData(['wishes']);

      queryClient.setQueryData(['wishes'], (old = []) => [
        { 
          id: `temp-${Date.now()}`, 
          name: newWish.name, 
          message: newWish.message, 
          approved: newWish.approved,
          createdAt: new Date().toISOString()
        }, 
        ...old
      ]);

      return { previousWishes };
    },
    onError: (err, newWish, context) => {
      if (context?.previousWishes) {
        queryClient.setQueryData(['wishes'], context.previousWishes);
      }
      console.error("Mesaj eklenirken hata oluştu:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishes'] });
    }
  });

  return { 
    wishes, 
    isLoading, 
    isError, 
    addWish: addWishMutation.mutateAsync,
    isAdding: addWishMutation.isPending
  };
}