
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set')
        }

        const { modelName, contents, config } = await req.json()

        console.log(`Processing request for model: ${modelName}`)

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: config
        })

        // contents from the client might be complex (multipart) or simple text
        // The SDK expects [ { role: 'user', parts: [...] } ] or similar structure
        // We pass it through directly as received from the trusted client service
        const result = await model.generateContent(contents)
        const response = await result.response
        const text = response.text()

        // We return a simplified structure or the full candidate object depending on client needs
        // For now, mirroring what the client expects: { text, candidates, usageMetadata }
        // Note: The SDK response object has methods, so we construct a plain JSON object

        const responseData = {
            text: text,
            candidates: response.candidates,
            usageMetadata: response.usageMetadata
        }

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Error in gemini-proxy:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
