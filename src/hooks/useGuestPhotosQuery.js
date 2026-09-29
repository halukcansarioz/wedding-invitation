import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export function useGuestPhotosQuery() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('guest_photos')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false });
      if (data && isMounted) setPhotos(data);
    };

    fetchPhotos();

    // Veritabanında onaylanan yeni fotoğrafları anında dinle
    const channel = supabase
      .channel('public:guest_photos')
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