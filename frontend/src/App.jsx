import { useState } from 'react'
import './App.css'

const API_URL = 'http://127.0.0.1:8000'

function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [elaUrl, setElaUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setElaUrl('')
    setResult(null)
    setError('')
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)
    setError('')
    setElaUrl('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed')
      }

      setResult(data)

      if (data.ela_map) {
        const filename = data.ela_map.split('/').pop()
        setElaUrl(`${API_URL}/outputs/${filename}`)
      }
    } catch (err) {
      setError(
        err.message ||
        'Unable to connect to the forensic analysis server.'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setElaUrl('')
    setResult(null)
    setError('')
  }

  return (
    <div className="app">

      <header className="header">
        <div className="brand">
          <div className="brand-mark">◉</div>

          <div>
            <div className="brand-name">Image Forensics</div>
            <div className="brand-subtitle">Digital Evidence Analysis</div>
          </div>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          System Ready
        </div>
      </header>

      <main className="main-content">

        <section className="hero-text">

          <div className="eyebrow">
            <span className="eyebrow-line"></span>
            DIGITAL IMAGE FORENSICS
          </div>

          <h1>
            Detect what the
            <br />
            <span className="hero-gradient">eye can't see.</span>
          </h1>

          <p>
            Analyze images for hidden signs of manipulation and
            digital alteration using forensic Error Level Analysis.
          </p>

        </section>

        <section className="upload-card">

          <div className="card-heading">
            <div>
              <span className="section-number">01</span>
              <h2>Analyze an Image</h2>
            </div>

            <p>
              Upload an image to begin forensic analysis.
            </p>
          </div>

          {!selectedFile && (
            <label className="upload-area">

              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageChange}
              />

              <span className="upload-icon">↑</span>

              <span className="upload-title">
                Drop your image here
              </span>

              <span className="upload-subtitle">
                or click to browse · PNG, JPG, JPEG, WEBP
              </span>

            </label>
          )}

          {selectedFile && (
            <div className="preview-section">

              <div className="preview-header">
                <div>
                  <span className="section-number">02</span>
                  <h3>Image Preview</h3>
                </div>

                <button
                  type="button"
                  className="clear-button"
                  onClick={clearImage}
                >
                  Remove
                </button>
              </div>

              <div className="image-container">
                <img
                  src={previewUrl}
                  alt="Selected image preview"
                  className="image-preview"
                />
              </div>

              <div className="file-info">
                <span className="file-name">
                  {selectedFile.name}
                </span>

                <span className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              {!result && (
                <button
                  type="button"
                  className="detect-button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="spinner"></span>
                      Running forensic analysis...
                    </>
                  ) : (
                    <>
                      Analyze Image
                      <span>→</span>
                    </>
                  )}
                </button>
              )}

            </div>
          )}

          {error && (
            <div className="error-message">
              <span>!</span>
              <div>
                <strong>Analysis failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {result && (
            <section className="results-section">

              <div className="results-heading">
                <div>
                  <span className="section-number">03</span>
                  <h2>Forensic Analysis</h2>
                </div>

                <div className="analysis-complete">
                  <span className="status-dot"></span>
                  Analysis Complete
                </div>
              </div>

              <div className="result-message">
                <div className="result-icon">✓</div>

                <div>
                  <strong>ELA map generated successfully</strong>
                  <p>
                    The image has been processed using Error Level
                    Analysis. Bright regions in the ELA map can
                    indicate areas requiring further forensic review.
                  </p>
                </div>
              </div>

              {elaUrl && (
                <div className="comparison-grid">

                  <div className="result-panel">
                    <div className="panel-label">
                      ORIGINAL IMAGE
                    </div>

                    <img
                      src={previewUrl}
                      alt="Original uploaded image"
                    />
                  </div>

                  <div className="result-panel">
                    <div className="panel-label">
                      ELA FORENSIC MAP
                    </div>

                    <img
                      src={elaUrl}
                      alt="Error Level Analysis result"
                    />
                  </div>

                </div>
              )}

              <div className="result-note">
                <span>i</span>
                <p>
                  ELA highlights differences in JPEG compression
                  levels. It is a forensic aid and does not by itself
                  establish that an image is authentic or tampered.
                </p>
              </div>

            </section>
          )}

        </section>

      </main>

      <footer className="footer">
        <span>IMAGE FORENSICS SYSTEM</span>
        <span>ELA · DIGITAL EVIDENCE · ANALYSIS</span>
      </footer>

    </div>
  )
}

export default App