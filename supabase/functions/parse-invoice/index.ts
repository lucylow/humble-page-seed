import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callOpenAI(prompt: string) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 900,
      temperature: 0.0
    })
  });
  
  if (!resp.ok) {
    const errorText = await resp.text();
    console.error('OpenAI API error:', resp.status, errorText);
    throw new Error(`OpenAI error: ${resp.status}`);
  }
  
  const body = await resp.json();
  const content = body.choices?.[0]?.message?.content ?? "";
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const body = await req.json().catch(() => ({}));
    const { text = "", file_url = null, owner = null } = body;

    if (!text && !file_url) {
      return new Response(
        JSON.stringify({ error: "text or file_url required" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Parsing invoice for owner:', owner);

    const prompt = `Extract invoice fields as JSON with keys:
invoice_number, date (YYYY-MM-DD), vendor_name, buyer_name, currency, total_amount (number), tax (number), discount (number), line_items (array of {description, qty, unit_price, amount}), confidence (0-1).

Invoice text:
"""${text}"""
Return only valid JSON.`;

    const modelOutput = await callOpenAI(prompt);
    console.log('OpenAI response received');

    let parsedJson: any = null;
    const jsonStart = modelOutput.indexOf("{");
    if (jsonStart >= 0) {
      try {
        parsedJson = JSON.parse(modelOutput.slice(jsonStart));
      } catch (e) {
        console.error('JSON parse error:', e);
        parsedJson = { raw: modelOutput };
      }
    } else {
      parsedJson = { raw: modelOutput };
    }

    const invoiceInsert = {
      owner: owner || null,
      invoice_number: parsedJson.invoice_number ?? null,
      date: parsedJson.date ?? null,
      vendor_name: parsedJson.vendor_name ?? null,
      buyer_name: parsedJson.buyer_name ?? null,
      currency: parsedJson.currency ?? "USD",
      total_amount: parsedJson.total_amount ?? null,
      tax: parsedJson.tax ?? 0,
      discount: parsedJson.discount ?? 0,
      parsed: parsedJson,
      parser_confidence: parsedJson.confidence ?? null,
      status: "parsed",
      storage_path: file_url ?? null
    };

    const { data: invData, error: invErr } = await supabase
      .from("invoices")
      .insert([invoiceInsert])
      .select()
      .single();
      
    if (invErr) {
      console.error('Invoice insert error:', invErr);
      throw invErr;
    }

    const invoiceId = invData.id;
    console.log('Invoice created:', invoiceId);

    if (Array.isArray(parsedJson.line_items)) {
      const items = parsedJson.line_items.map((li: any) => ({
        invoice_id: invoiceId,
        description: li.description ?? "",
        qty: li.qty ?? 1,
        unit_price: li.unit_price ?? li.unitPrice ?? 0,
        line_total: li.amount ?? ((li.qty ?? 1) * (li.unit_price ?? li.unitPrice ?? 0))
      }));
      
      if (items.length) {
        const { error: itemsErr } = await supabase
          .from("invoice_line_items")
          .insert(items);
          
        if (itemsErr) {
          console.warn("line items insert error", itemsErr);
        } else {
          console.log('Line items inserted:', items.length);
        }
      }
    }

    return new Response(
      JSON.stringify({ invoice: invData, parsed: parsedJson }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error("parse-invoice error", err);
    return new Response(
      JSON.stringify({ error: String(err) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
