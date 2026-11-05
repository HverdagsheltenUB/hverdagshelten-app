// Adressen og den offentlige nøkkelen til Supabase-prosjektet (databasen bak appen).
// Nøkkelen er laget for å ligge i appen: reglene i databasen (se supabase/oppsett.sql)
// bestemmer hva hver bruker får lese og endre. Legg aldri inn «service_role» eller «secret»-nøkkelen her.
//
// Verdiene kan også settes med EXPO_PUBLIC_SUPABASE_URL og EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pbwkfdugczwksvvrnekp.supabase.co';
export const supabaseNokkel = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_IDx-_bC45_mpeBwas_Dp_w_Z5M4G0fM';

export const supabaseKlar = supabaseUrl.startsWith('https://') && supabaseNokkel.length > 20;
