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
    const { invoice_id, seller_address, buyer_address, creator } = body;
    
    if (!invoice_id || !seller_address || !buyer_address) {
      return new Response(
        JSON.stringify({ error: "missing required fields: invoice_id, seller_address, buyer_address" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating deal for invoice:', invoice_id);

    const { data: invoice, error: invoiceErr } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoice_id)
      .single();
      
    if (invoiceErr) {
      console.error('Invoice not found:', invoiceErr);
      throw invoiceErr;
    }

    if (creator && invoice.owner && invoice.owner !== creator) {
      console.warn('Creator does not own invoice');
      return new Response(
        JSON.stringify({ error: "creator does not own invoice" }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount = invoice.total_amount;

    const { data: deal, error: dealErr } = await supabase
      .from("deals")
      .insert([{
        invoice_id,
        creator: creator ?? invoice.owner,
        seller_address,
        buyer_address,
        amount,
        currency: invoice.currency,
        state: "pending"
      }])
      .select()
      .single();

    if (dealErr) {
      console.error('Deal insert error:', dealErr);
      throw dealErr;
    }

    console.log('Deal created:', deal.id);

    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert([{
        deals_id: deal.id,
        provider: "local-relayer",
        tx_id: null,
        status: "pending",
        meta: { note: "Awaiting on-chain submission" }
      }])
      .select()
      .single();

    if (txErr) {
      console.warn("tx insert error", txErr);
    } else {
      console.log('Transaction placeholder created:', tx.id);
    }

    return new Response(
      JSON.stringify({ deal, tx }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    console.error("create-deal error", err);
    return new Response(
      JSON.stringify({ error: String(err) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
