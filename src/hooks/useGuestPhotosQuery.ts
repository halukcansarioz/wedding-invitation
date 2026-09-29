// src/hooks/useGuestPhotosQuery.ts
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useGuestPhotosQuery() {
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const channelName = `public:guest_photos-${Date.now()}`;

    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('guest_photos')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (data && isMounted) setPhotos(data);
    };

    fetchPhotos();

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_photos', filter: 'approved=eq.true' }, () => {
          if (isMounted) fetchPhotos();
      })
      .subscribe();

    return () => { 
      isMounted = false;
      supabase.removeChannel(channel).catch(console.error); 
    };
  }, []);

  return { photos };
}