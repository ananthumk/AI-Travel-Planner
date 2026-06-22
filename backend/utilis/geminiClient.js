const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

async function callGemini(systemInstruction, userPrompt, responseSchema = null) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables')
    }

    const url = `${BASE_URL}/${GEMINI_MODEL}:generateContent`

    const generationConfig = {
        temperature: 0.7,
        responseMimeType: 'application/json'
    }
    if (responseSchema) {
        generationConfig.responseSchema = responseSchema
    }

    const body = {
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: userPrompt }]
            }
        ],
        generationConfig
    }

    const MAX_RETRIES = 5
    let attempt = 0
    let lastError
    let delayMs = 1000

    while (attempt < MAX_RETRIES) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify(body)
            })

            if (!response.ok) {
                const errText = await response.text()
                throw new Error(`Gemini request failed: HTTP ${response.status} - ${errText}`)
            }

            const data = await response.json()
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
            if (!text) {
                throw new Error('Gemini returned an empty response')
            }

            return JSON.parse(text)
        } catch (error) {
            lastError = error
            attempt += 1

            if (attempt >= MAX_RETRIES) break

            console.warn(
                `[Gemini] attempt ${attempt} failed (${error.message}). Retrying in ${delayMs}ms...`
            )
            await new Promise((resolve) => setTimeout(resolve, delayMs))
            delayMs *= 2 // 1s -> 2s -> 4s -> 8s -> 16s
        }
    }

    // This MUST be outside the while loop - it's the final failure after
    // all retries are exhausted, not something to run after every attempt.
    throw new Error(`Gemini API call failed after ${MAX_RETRIES} attempts: ${lastError.message}`)
}

module.exports = { callGemini }