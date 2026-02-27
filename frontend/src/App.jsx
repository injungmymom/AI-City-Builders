import { useState, useCallback, useRef, useEffect } from 'react'
import Header from './components/Header'
import CharacterUpload from './components/CharacterUpload'
import ProgressTracker from './components/ProgressTracker'
import VideoPlayer from './components/VideoPlayer'

// 🏙️ AI City Builders - 관제 센터 (Main Dashboard)
// VITE_API_BASE가 설정되어 있으면 그 주소를 사용하고, 아니면 상대 경로(프록시)를 사용합니다.
const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function App() {
    // ── State ──
    const [characterFile, setCharacterFile] = useState(null)
    const [keyword, setKeyword] = useState('')
    const [stylePrompt, setStylePrompt] = useState('modern, sleek, professional product photography')
    const [videoHint, setVideoHint] = useState('smooth camera movement, cinematic lighting')
    const [isGenerating, setIsGenerating] = useState(false)
    const [taskId, setTaskId] = useState(null)
    const [stages, setStages] = useState([])
    const [progress, setProgress] = useState(0)
    const [metadata, setMetadata] = useState(null)
    const [videoUrl, setVideoUrl] = useState(null)
    const [error, setError] = useState(null)

    const pollingRef = useRef(null)

    // ── 공정 시작 ──
    const startGeneration = useCallback(async () => {
        if (!keyword.trim()) return
        setIsGenerating(true)
        setError(null)
        setStages([])
        setProgress(0)
        setMetadata(null)
        setVideoUrl(null)

        try {
            const formData = new FormData()
            formData.append('product_keyword', keyword)
            formData.append('style_prompt', stylePrompt)
            formData.append('video_prompt_hint', videoHint)
            if (characterFile) {
                formData.append('character_image', characterFile)
            }

            const res = await fetch(`${API_BASE}/generate`, {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) throw new Error('공정 시작 실패!')
            const data = await res.json()
            setTaskId(data.task_id)

            // Polling 시작
            startPolling(data.task_id)
        } catch (err) {
            setError(`🚨 지진 발생: ${err.message}`)
            setIsGenerating(false)
        }
    }, [keyword, stylePrompt, videoHint, characterFile])

    // ── 상태 폴링 ──
    const startPolling = useCallback((tid) => {
        if (pollingRef.current) clearInterval(pollingRef.current)

        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/status/${tid}`)
                if (!res.ok) return
                const data = await res.json()

                setStages(data.stages || [])
                setProgress(data.progress || 0)

                if (data.metadata) setMetadata(data.metadata)

                if (data.current_stage === 'completed') {
                    setVideoUrl(data.final_video_url)
                    setIsGenerating(false)
                    clearInterval(pollingRef.current)
                } else if (data.current_stage === 'failed') {
                    setError('🚨 공정 중 지진이 발생했습니다. 다시 시도해주세요.')
                    setIsGenerating(false)
                    clearInterval(pollingRef.current)
                }
            } catch (err) {
                console.error('Polling error:', err)
            }
        }, 2000)
    }, [])

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current)
        }
    }, [])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Animated Grid Background */}
            <div className="city-bg">
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 1.2}s`,
                            background: i % 2 === 0 ? 'var(--color-neon-blue)' : 'var(--color-neon-purple)',
                            width: `${3 + (i % 3)}px`,
                            height: `${3 + (i % 3)}px`,
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main style={{
                position: 'relative',
                zIndex: 10,
                flex: 1,
                padding: '32px',
                maxWidth: '1200px',
                width: '100%',
                margin: '0 auto',
            }}>
                {/* City Title */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '2rem',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.03em',
                        marginBottom: '8px',
                    }}>
                        초자동화 영상 생산 도시
                    </h2>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        maxWidth: '500px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
                        키워드 하나로 트렌드 분석부터 영상 제작까지.
                        AI가 모든 공정을 자동으로 처리합니다.
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    alignItems: 'start',
                }}>
                    {/* LEFT COLUMN: 입력 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Keyword Input */}
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <span style={{ fontSize: '1.2rem' }}>🔑</span>
                                <h3 style={{
                                    fontFamily: "'Outfit', sans-serif",
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}>
                                    제품 키워드
                                </h3>
                            </div>

                            <input
                                id="keyword-input"
                                type="text"
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                placeholder="예: 무선 이어폰, 스마트워치, LED 조명..."
                                disabled={isGenerating}
                                style={{
                                    width: '100%',
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-city-border)',
                                    background: 'var(--color-city-glass)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.9rem',
                                    fontFamily: 'var(--font-body)',
                                    outline: 'none',
                                    transition: 'border-color 0.3s ease',
                                    marginBottom: '12px',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-neon-blue)'}
                                onBlur={e => e.target.style.borderColor = 'var(--color-city-border)'}
                            />

                            {/* Advanced Options (collapsible) */}
                            <details style={{ marginBottom: '16px' }}>
                                <summary style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    marginBottom: '10px',
                                    userSelect: 'none',
                                }}>
                                    ⚙️ 고급 설정
                                </summary>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                        이미지 스타일
                                    </label>
                                    <input
                                        type="text"
                                        value={stylePrompt}
                                        onChange={e => setStylePrompt(e.target.value)}
                                        disabled={isGenerating}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-city-border)',
                                            background: 'var(--color-city-glass)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '0.8rem',
                                            fontFamily: 'var(--font-body)',
                                            outline: 'none',
                                        }}
                                    />
                                    <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                        영상 연출
                                    </label>
                                    <input
                                        type="text"
                                        value={videoHint}
                                        onChange={e => setVideoHint(e.target.value)}
                                        disabled={isGenerating}
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-city-border)',
                                            background: 'var(--color-city-glass)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '0.8rem',
                                            fontFamily: 'var(--font-body)',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </details>

                            {/* Generate Button */}
                            <button
                                id="generate-btn"
                                className="neon-btn"
                                onClick={startGeneration}
                                disabled={!keyword.trim() || isGenerating}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    fontSize: '1rem',
                                }}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="spinner" style={{ borderTopColor: 'white' }} />
                                        <span>공사 진행 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🚀</span>
                                        <span>착공 시작!</span>
                                    </>
                                )}
                            </button>

                            {/* Error Display */}
                            {error && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>{error}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                        💡 Tip: 지진이 계속된다면 `start_servers.bat`를 다시 실행해 보세요!
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Character Upload */}
                        <CharacterUpload
                            onFileSelect={setCharacterFile}
                            selectedFile={characterFile}
                        />
                    </div>

                    {/* RIGHT COLUMN: 상황판 + 영상 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <ProgressTracker
                            stages={stages}
                            progress={progress}
                            metadata={metadata}
                        />
                        <VideoPlayer
                            videoUrl={videoUrl}
                            taskId={taskId}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                padding: '20px',
                borderTop: '1px solid var(--color-city-border)',
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
            }}>
                <p>
                    🏙️ AI City Builders · Powered by{' '}
                    <span style={{ color: 'var(--color-neon-blue)' }}>Google Gemini 3</span>{' & '}
                    <span style={{ color: 'var(--color-neon-purple)' }}>Veo 3.1</span>
                </p>
            </footer>
        </div>
    )
}
