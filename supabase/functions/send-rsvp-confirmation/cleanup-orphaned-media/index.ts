import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    // Sadece yetkili (Cron service veya Admin) tarafından çağrıldığından emin ol
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
        return new Response('Unauthorized - Invalid Token', { status: 401 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const usedUrls = new Set<string>();

    // 1. Veritabanındaki aktif olarak kullanılan tüm medya URL'lerini topla
    // Settings tablosundan topla
    const { data: settingsData } = await supabaseAdmin.from('settings').select('data');
    if (settingsData) {
       settingsData.forEach(row => {
          const data = row.data;
          if (data?.invitation?.heroImage) usedUrls.add(data.invitation.heroImage);
          if (data?.invitation?.heroVideo) usedUrls.add(data.invitation.heroVideo);
          if (data?.invitation?.musicFile) usedUrls.add(data.invitation.musicFile);
          if (data?.invitation?.gallery) {
              data.invitation.gallery.forEach((url: string) => usedUrls.add(url));
          }
          if (data?.storyTimeline) {
              data.storyTimeline.forEach((item: any) => item.image && usedUrls.add(item.image));
          }
       });
    }

    // Guest Photos tablosundan topla (Misafir POV)
    const { data: guestPhotos } = await supabaseAdmin.from('guest_photos').select('image_url');
    if (guestPhotos) {
        guestPhotos.forEach(row => usedUrls.add(row.image_url));
    }

    // Wishes tablosundan topla (Sesli mesaj kayıtları vs.)
    const { data: wishes } = await supabaseAdmin.from('wishes').select('audioUrl');
    if (wishes) {
        wishes.forEach(row => row.audioUrl && usedUrls.add(row.audioUrl));
    }

    let deletedCount = 0;
    // Taranacak klasör adları
    const foldersToScan = ['images', 'media', 'music', 'audio_wishes'];

    // 2. Storage tarafını tara ve DB'de geçmeyenleri (yetim dosyalar) sil
    for (const folder of foldersToScan) {
        const { data: files } = await supabaseAdmin.storage.from('wedding-media').list(folder);
        if (!files) continue;

        const filesToDelete: string[] = [];
        
        for (const file of files) {
           // Klasörün kendisini temsil eden placeholder dosyalarını silme
           if (file.name === '.emptyFolderPlaceholder') continue;
           
           const publicUrlRes = supabaseAdmin.storage.from('wedding-media').getPublicUrl(`${folder}/${file.name}`);
           const fileUrl = publicUrlRes.data.publicUrl;

           // Eğer dosyanın public URL'i aktif listemizde (usedUrls) yoksa, silinecekler listesine ekle
           if (!usedUrls.has(fileUrl)) {
               filesToDelete.push(`${folder}/${file.name}`);
           }
        }

        // Toplu Silme İşlemi (Batch Delete)
        if (filesToDelete.length > 0) {
            await supabaseAdmin.storage.from('wedding-media').remove(filesToDelete);
            deletedCount += filesToDelete.length;
        }
    }

    return new Response(
      JSON.stringify({ success: true, deletedCount, message: `${deletedCount} yetim dosya kalıcı olarak temizlendi.` }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Storage Cleanup Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});