/**
 * 📊 ProgressTracker - 실시간 상황판
 * 4단계 파이프라인 진행 상태를 애니메이션 카드로 표시
 */

const STAGES = [
    {
        key: 'market_research',
        icon: '🔍',
        label: '시장 조사',
        zone: 'Zone 1',
        model: 'Gemini 3 Flash',
        desc: '트렌드 분석 & 메타데이터 생성',
    },
    {
        key: 'image_generation',
        icon: '🎨',
        label: '자재 생산',
        zone: 'Zone 2',
        model: 'Gemini 3 Pro',
        desc: '제품 이미지 생성',
    },
    {
        key: 'image_synthesis',
        icon: '🧬',
        label: '합성 연구소',
        zone: 'Zone 3',
        model: 'Gemini 3 Pro',
        desc: '캐릭터 + 제품 합성',
    },
    {
        key: 'video_generation',
        icon: '🎬',
        label: '방송국',
        zone: 'Zone 4',
        model: 'Veo 3.1',
        desc: '8초 영상 생성',
    },
]

function StageIcon({ status }) {
    if (status === 'completed') return <span style={{ color: '#10b981', fontSize: '1.1rem' }}>✓</span>
    if (status === 'skipped') return <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>⏭</span>
    if (status === 'running') return <div className="spinner" />
    if (status === 'failed') return <span style={{ color: '#ef4444', fontSize: '1.1rem' }}>✕</span>
    return <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>○</span>
}

export default function ProgressTracker({ stages = [], progress = 0, metadata = null }) {
    const getStageStatus = (key) => {
        const found = stages.find(s => s.stage === key)
        return found?.status || 'pending'
    }

    const getStageMessage = (key) => {
        const found = stages.find(s => s.stage === key)
        return found?.message || '대기 중'
    }

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            {/* Section Title */}
            <div style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📡</span>
                    <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 600,
                    }}>
                        실시간 상황판
                    </h3>
                </div>
                <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                    color: progress === 100 ? '#10b981' : 'var(--color-neon-blue)',
                }}>
                    {progress}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-track" style={{ marginBottom: '20px' }}>
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Stage Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {STAGES.map((stage, idx) => {
                    const status = getStageStatus(stage.key)
                    const message = getStageMessage(stage.key)
                    const isActive = status === 'running'

                    return (
                        <div
                            key={stage.key}
                            className={`stage-card ${isActive ? 'active animate-pulse-neon' : ''} ${status === 'completed' || status === 'skipped' ? 'completed' : ''} ${status === 'failed' ? 'failed' : ''}`}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                            }}>
                                {/* Status Icon */}
                                <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isActive
                                        ? 'rgba(0, 212, 255, 0.1)'
                                        : status === 'completed'
                                            ? 'rgba(16, 185, 129, 0.1)'
                                            : 'var(--color-city-glass)',
                                    flexShrink: 0,
                                }}>
                                    <StageIcon status={status} />
                                </div>

                                {/* Stage Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '2px',
                                    }}>
                                        <span style={{ fontSize: '0.95rem' }}>{stage.icon}</span>
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            fontFamily: "'Outfit', sans-serif",
                                        }}>
                                            {stage.label}
                                        </span>
                                        <span style={{
                                            fontSize: '0.6rem',
                                            color: 'var(--color-text-muted)',
                                            fontWeight: 500,
                                            marginLeft: 'auto',
                                        }}>
                                            {stage.zone} · {stage.model}
                                        </span>
                                    </div>
                                    <p style={{
                                        fontSize: '0.72rem',
                                        color: isActive ? 'var(--color-neon-blue)' : 'var(--color-text-muted)',
                                        fontWeight: isActive ? 500 : 400,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}>
                                        {message}
                                    </p>
                                </div>
                            </div>

                            {/* Connector Line */}
                            {idx < STAGES.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    left: '41px',
                                    bottom: '-12px',
                                    width: '2px',
                                    height: '12px',
                                    background: status === 'completed' || status === 'skipped'
                                        ? 'rgba(16, 185, 129, 0.3)'
                                        : 'var(--color-city-border)',
                                    zIndex: 1,
                                }} />
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Metadata Card (트렌드 결과) */}
            {metadata && (
                <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(0, 212, 255, 0.03)',
                    border: '1px solid rgba(0, 212, 255, 0.1)',
                }}>
                    <p style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--color-neon-blue)',
                        marginBottom: '8px',
                    }}>
                        📋 시장 조사 결과
                    </p>
                    {metadata.title && (
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                            {metadata.title}
                        </p>
                    )}
                    {metadata.description && (
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                            {metadata.description}
                        </p>
                    )}
                    {metadata.tags && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {metadata.tags.map((tag, i) => (
                                <span key={i} className="tag-pill">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
