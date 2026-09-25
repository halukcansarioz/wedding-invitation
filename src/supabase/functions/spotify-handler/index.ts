import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const client_id = Deno.env.get('SPOTIFY_CLIENT_ID');
const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
const refresh_token = Deno.env.get('SPOTIFY_REFRESH_TOKEN');
const playlist_id = Deno.env.get('SPOTIFY_PLAYLIST_ID');

const basic = btoa(`${client_id}:${client_secret}`);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token!,
    }),
  });
  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, query, trackUri } = await req.json();
    const token = await getAccessToken();

    if (action === 'search') {
      const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await searchRes.json();
      
      const tracks = data.tracks.items.map((track: any) => ({
        id: track.id,
        uri: track.uri,
        name: track.name,
        artist: track.artists[0].name,
        image: track.album.images[2]?.url
      }));
      return new Response(JSON.stringify({ success: true, tracks }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'add' && trackUri) {
      await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ uris: [trackUri] }),
      });
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error("Geçersiz işlem.");

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { headers: corsHeaders, status: 400 });
  }
});