// src/hooks/useGuestsQuery.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadGuestsFromDatabase, supabase } from '../services/database';
import { uiGuestToDb } from '../utils/helpers';

export function useGuestsQuery() {
  const queryClient = useQueryClient();

  // 1. Veriyi Çekme (Fetch & Cache)
  const { data: guests = [], isLoading, isError } = useQuery({
    queryKey: ['guests'],
    queryFn: loadGuestsFromDatabase,
  });

  // 2. Veri Ekleme (Mutation) ve İyimser Güncelleme
  const addGuestMutation = useMutation({
    mutationFn: async (newGuestData) => {
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: { 
          type: 'guest', 
          data: uiGuestToDb(newGuestData), 
          turnstileToken: newGuestData.turnstileToken 
        }
      });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || "Sunucu hatası.");
      }
      return data.data;
    },
    onMutate: async (newGuest) => {
      // Devam eden işlemleri durdur
      await queryClient.cancelQueries({ queryKey: ['guests'] });
      const previousGuests = queryClient.getQueryData(['guests']);
      
      // Anında arayüze ekle (Kullanıcı beklemez)
      queryClient.setQueryData(['guests'], (old = []) => [
        { 
          id: `temp-${Date.now()}`, 
          name: newGuest.name, 
          attendance: newGuest.attendance,
          phone: newGuest.phone || "",
          personCount: String(newGuest.personCount || 1),
          side: newGuest.side || "Gelin Tarafı",
          hasChild: newGuest.hasChild || "Hayır",
          note: newGuest.note || "",
          has_arrived: false,
          createdAt: new Date().toISOString()
        }, 
        ...old
      ]);

      return { previousGuests };
    },
    onError: (err, newGuest, context) => {
      // Hata olursa eski haline döndür
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests'], context.previousGuests);
      }
      console.error("LCV eklenirken hata oluştu:", err);
    },
    onSettled: () => {
      // Gerçek veriyi arkada tekrar çek
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    }
  });

  return { 
    guests, 
    isLoading, 
    isError, 
    addGuest: addGuestMutation.mutateAsync,
    isAdding: addGuestMutation.isPending
  };
}