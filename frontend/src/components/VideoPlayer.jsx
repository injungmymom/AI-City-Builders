/**
 * 📺 VideoPlayer - 대형 전광판
 * 완성된 영상 재생 + 다운로드 버튼
 */
export default function VideoPlayer({ videoUrl, taskId }) {
    if (!videoUrl) {
        return (
            <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📺</span>
                    <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 600,
                    }}>
                        대형 전광판
                    </h3>
                </div>
                <div className="video-container" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-city-glass)',
                    border: '1px solid var(--color-city-border)',
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '12px',
                        opacity: 0.3,
                    }}>
                        🎬
                    </div>
                    <p style={{
                        fontSize: '0.85rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 500,
                    }}>
                        영상 대기 중...
                    </p>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        marginTop: '4px',
                        opacity: 0.6,
                    }}>
                        공정이 완료되면 여기에 영상이 표시됩니다
                    </p>
                </div>
            </div>
        )
    }

    const downloadUrl = videoUrl

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📺</span>
                    <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 600,
                    }}>
                        대형 전광판
                    </h3>
                </div>
                <div className="tag-pill" style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                }}>
                    ✅ 송출 완료
                </div>
            </div>

            {/* Video */}
            <div className="video-container" style={{
                marginBottom: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 0 40px rgba(0, 212, 255, 0.1)',
            }}>
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    style={{ borderRadius: '16px' }}
                />
            </div>

            {/* Download Button */}
            <a
                href={downloadUrl}
                download={`ai_city_${taskId || 'video'}.mp4`}
                style={{ textDecoration: 'none', display: 'block' }}
            >
                <button
                    className="neon-btn"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <span>📥</span>
                    <span>영상 다운로드</span>
                </button>
            </a>
        </div>
    )
}
