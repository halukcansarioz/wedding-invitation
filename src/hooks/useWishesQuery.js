import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadPublishedWishesFromDatabase } from '../services/database';
import { supabase } from '../supabaseClient';

export function useWishesQuery() {
  const queryClient = useQueryClient();

  // 1. Veriyi Çekme (Fetch & Cache)
  const { data: wishes = [], isLoading, isError } = useQuery({
    queryKey: ['wishes'], // Cache anahtarı
    queryFn: loadPublishedWishesFromDatabase, // Fetch fonksiyonu
  });

  // 2. Veri Ekleme (Mutation) ve İyimser Güncelleme (Optimistic Update)
  const addWishMutation = useMutation({
    mutationFn: async (newWishData) => {
      // Supabase Edge Function çağrısı
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: { 
          type: 'wish', 
          data: {
            name: newWishData.name,
            message: newWishData.message,
            approved: newWishData.approved 
          }, 
          turnstileToken: newWishData.turnstileToken 
        }
      });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || "Sunucu hatası.");
      }
      return data.data;
    },
    
    // İşlem tetiklendiği an (Sunucuyu beklemeden arayüzü anında güncelle)
    onMutate: async (newWish) => {
      // Devam eden fetch işlemlerini iptal et ki üstüne yazmasın
      await queryClient.cancelQueries({ queryKey: ['wishes'] });

      // Hata durumunda geri dönmek için eski veriyi sakla
      const previousWishes = queryClient.getQueryData(['wishes']);

      // Yeni veriyi geçici bir ID ile anında listeye ekle
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

    // Eğer sunucudan hata dönerse
    onError: (err, newWish, context) => {
      // Arayüzü eski (hatasız) haline geri döndür
      if (context?.previousWishes) {
        queryClient.setQueryData(['wishes'], context.previousWishes);
      }
      console.error("Mesaj eklenirken hata oluştu:", err);
    },

    // Başarılı ya da başarısız, işlem bitince
    onSettled: () => {
      // Sunucudaki gerçek ve son veriyi arka planda tekrar çek (Senkronize et)
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