import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }
    
    const body = await req.json().catch(() => ({}));
    const { tx_id, provider, status, meta } = body;
    
    if (!tx_id || !provider || !status) {
      return new Response(
        JSON.stringify({ error: "missing required fields: tx_id, provider, status" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing webhook for tx:', tx_id, 'provider:', provider, 'status:', status);

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .select("*")
      .eq("tx_id", tx_id)
      .eq("provider", provider)
      .limit(1)
      .maybeSingle();

    if (txErr) {
      console.error('Error fetching transaction:', txErr);
      throw txErr;
    }

    if (!tx) {
      console.log('Transaction not found, creating new record');
      const { data: newTx, error: insErr } = await supabase
        .from("transactions")
        .insert([{
          deals_id: null,
          provider,
          tx_id,
          status,
          meta
        }])
        .select()
        .single();
        
      if (insErr) {
        console.error('Insert error:', insErr);
        throw insErr;
      }
      
      return new Response(
        JSON.stringify({ transaction: newTx }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: updatedTx, error: updErr } = await supabase
      .from("transactions")
      .update({
        status, 
        meta: meta ?? tx.meta, 
        updated_at: new Date().toISOString()
      })
      .eq("id", tx.id)
      .select()
      .single();

    if (updErr) {
      console.error('Update error:', updErr);
      throw updErr;
    }

    console.log('Transaction updated:', updatedTx.id);

    if (tx.deals_id) {
      const newState = status === "confirmed" ? "onchain" : status === "failed" ? "failed" : null;
      if (newState) {
        console.log('Updating deal state to:', newState);
        await supabase
          .from("deals")
          .update({ 
            state: newState, 
            chain_tx_id: tx_id, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", tx.deals_id);
      }
    }

    return new Response(
      JSON.stringify({ transaction: updatedTx }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error("tx-webhook error", err);
    return new Response(
      JSON.stringify({ error: String(err) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
