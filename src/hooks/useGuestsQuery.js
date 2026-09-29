import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loadGuestsFromDatabase } from '../services/database';
import { supabase } from '../supabaseClient';
import { uiGuestToDb } from '../utils/helpers';

export function useGuestsQuery() {
  const queryClient = useQueryClient();

  const { data: guests = [], isLoading, isError } = useQuery({
    queryKey: ['guests'],
    queryFn: loadGuestsFromDatabase,
  });

  // YENİ: Supabase Realtime ile Canlı Akış (Admin Panel için)
  useEffect(() => {
    const channel = supabase
      .channel('public:guests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, () => {
        // Veritabanında bir değişiklik olduğunda anında arayüzü günceller
        queryClient.invalidateQueries({ queryKey: ['guests'] });
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const addGuestMutation = useMutation({
    mutationFn: async (newGuestData) => {
      const token = navigator.onLine ? newGuestData.turnstileToken : "OFFLINE_SYNC";
      
      const { data, error } = await supabase.functions.invoke('submit-form', {
        body: { 
          type: 'guest', 
          data: uiGuestToDb(newGuestData), 
          turnstileToken: token 
        }
      });

      if (error || !data.success) {
        throw new Error(error?.message || data?.error || "Sunucu hatası.");
      }
      return data.data;
    },
    onMutate: async (newGuest) => {
      await queryClient.cancelQueries({ queryKey: ['guests'] });
      const previousGuests = queryClient.getQueryData(['guests']);
      
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
      if (context?.previousGuests) {
        queryClient.setQueryData(['guests'], context.previousGuests);
      }
      console.error("LCV eklenirken hata oluştu:", err);
    },
    onSettled: () => {
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