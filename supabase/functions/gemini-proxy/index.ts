
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.0"

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

        // Normalize contents format for SDK compatibility
        // The SDK expects either a string or properly formatted content parts
        let normalizedContents = contents;

        // If contents is an array and first item has 'parts', transform it
        if (Array.isArray(contents) && contents.length > 0) {
            // Check if it's in the old format [{parts: [{text: '...'}]}]
            if (contents[0].parts && Array.isArray(contents[0].parts)) {
                // Check if ANY part has inlineData (multimodal). If so, DO NOT FLATTEN.
                const hasBinary = contents[0].parts.some((p: any) => p.inlineData);

                // Only extract text if it's a pure text request
                if (!hasBinary) {
                    const textParts = contents[0].parts
                        .filter((p: any) => p.text)
                        .map((p: any) => p.text)
                        .join('\n');

                    if (textParts) {
                        normalizedContents = textParts;
                    }
                }
            }
        }

        const result = await model.generateContent(normalizedContents)
        const response = await result.response
        let text = '';
        try {
            text = response.text();
        } catch (e) {
            console.warn("Could not get text from response (likely safety block or empty):", e);
        }

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
