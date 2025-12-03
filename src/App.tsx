import { useState, useEffect } from 'react'
import './App.css'
import { GoogleGenAI } from '@google/genai'

interface CorrectionResult {
  correctedText: string
  wordUsage: string
  explanation: string
}

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
      setError('Please enter a sentence to correct.')
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

      const prompt = `You are an English grammar correction assistant. Analyze the following sentence and provide:

1. CORRECTED_TEXT: The grammatically correct version of the sentence (simple and concise, remove unnecessary words)
2. WORD_USAGE: Identify words used incorrectly and explain the correct word type/usage
3. EXPLANATION: Explain how to make the sentence correct

Input sentence: "${inputText}"

Format your response EXACTLY as follows:
CORRECTED_TEXT:
[corrected sentence here]

WORD_USAGE:
[word usage corrections here]

EXPLANATION:
[explanation here]`

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      })
      const text = response.text || ''

      if (!text) {
        throw new Error('No response from API')
      }

      // Parse the response
      const correctedMatch = text.match(/CORRECTED_TEXT:\s*([\s\S]*?)(?=WORD_USAGE:|$)/)
      const wordUsageMatch = text.match(/WORD_USAGE:\s*([\s\S]*?)(?=EXPLANATION:|$)/)
      const explanationMatch = text.match(/EXPLANATION:\s*([\s\S]*)/)

      setResult({
        correctedText: correctedMatch ? correctedMatch[1].trim() : 'No correction found',
        wordUsage: wordUsageMatch ? wordUsageMatch[1].trim() : 'No word usage information found',
        explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation found'
      })
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
          <label htmlFor="input-text">Enter your sentence:</label>
          <div className="input-group">
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your English sentence here..."
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
