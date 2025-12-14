import { useState, useEffect } from 'react'
import './App.css'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Define the schema for grammar correction response
const correctionSchema = z.object({
  correctedText: z.string().describe('The grammatically correct version of the text with all original formatting preserved (line breaks, lists, etc.). Only fix grammar and spelling errors - DO NOT change the meaning, tone, or intent of the original text.'),
  wordUsage: z.string().describe('Identify words used incorrectly and explain the correct word type/usage'),
  explanation: z.string().describe('Explain how to make the text correct')
})

type CorrectionResult = z.infer<typeof correctionSchema>

function App() {
  const [apiKey, setApiKey] = useState<string>('')
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [tempApiKey, setTempApiKey] = useState<string>('')
  const [inputText, setInputText] = useState<string>('')
  const [result, setResult] = useState<CorrectionResult | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [simpleView, setSimpleView] = useState<boolean>(false)

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    } else {
      setShowSettings(true)
    }
  }, [])

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('gemini_api_key', tempApiKey.trim())
      setApiKey(tempApiKey.trim())
      setShowSettings(false)
      setTempApiKey('')
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
    } catch (err) {
      setError('Failed to read clipboard. Please paste manually.')
    }
  }

  const handleCorrect = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to correct.')
      return
    }

    if (!apiKey) {
      setShowSettings(true)
      setError('Please set your Google API key first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey })

      const prompt = `You are an English grammar correction assistant. Analyze the following text:

"${inputText}"

CRITICAL INSTRUCTIONS:
- ONLY correct grammar and spelling errors
- DO NOT change the meaning of the original sentence
- DO NOT rephrase or rewrite the content
- Preserve the original intent, tone, and message exactly as written
- Preserve the original formatting exactly, including line breaks, paragraph breaks, bullet points, numbered lists, and any other formatting structures

Provide:
1. The grammatically correct version of the text with all errors fixed but meaning unchanged
2. Identify words used incorrectly and explain the correct word type/usage
3. Explain how to make the text correct`

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: zodToJsonSchema(correctionSchema)
        }
      })

      const text = response.text || ''

      if (!text) {
        throw new Error('No response from API')
      }

      // Parse and validate the JSON response with Zod
      const result = correctionSchema.parse(JSON.parse(text))
      setResult(result)
    } catch (err) {
      setError('Failed to get correction. Please check your API key and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Happy English</h1>
        <p>Grammar Correction Tool</p>
        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          ⚙️ Settings
        </button>
      </header>

      {showSettings && (
        <div className="modal-overlay" onClick={() => !apiKey && setShowSettings(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>API Settings</h2>
            <p>Enter your Google Gemini API key</p>
            <p className="help-text">
              Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
            </p>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter API key"
              className="api-input"
            />
            <div className="modal-actions">
              <button onClick={handleSaveApiKey}>Save</button>
              {apiKey && <button onClick={() => setShowSettings(false)}>Cancel</button>}
            </div>
          </div>
        </div>
      )}

      <main className="main">
        <div className="input-section">
          <label htmlFor="input-text">Enter your text:</label>
          <div className="input-group">
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your English text here (formatting like line breaks and lists will be preserved)..."
              rows={4}
            />
            <button onClick={handlePaste} className="paste-btn">
              📋 Paste
            </button>
          </div>
          <button onClick={handleCorrect} disabled={loading} className="correct-btn">
            {loading ? 'Correcting...' : 'Correct Grammar'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {result && (
          <>
            <div className="view-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={simpleView}
                  onChange={(e) => setSimpleView(e.target.checked)}
                />
                Show simple view (corrected text only)
              </label>
            </div>

            <div className="results">
              <div className="result-section">
                <h3>Corrected Grammar</h3>
                <div className="result-content">
                  <p>{result.correctedText}</p>
                  <button onClick={() => handleCopy(result.correctedText)} className="copy-btn">
                    📄 Copy
                  </button>
                </div>
              </div>

              {!simpleView && (
                <>
                  <div className="result-section">
                    <h3>Word Usage</h3>
                    <div className="result-content">
                      <p>{result.wordUsage}</p>
                    </div>
                  </div>

                  <div className="result-section">
                    <h3>Explanation</h3>
                    <div className="result-content">
                      <p>{result.explanation}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
