import { useState, useEffect } from 'react'

/**
 * 🏙️ Header - 도시 헤더
 * 글라스모피즘 + 네온 로고
 */
export default function Header() {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <header className="glass-card" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 0,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
        }}>
            {/* Logo + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
                }}>
                    🏙️
                </div>
                <div>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}>
                        AI CITY BUILDERS
                    </h1>
                    <p style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 500,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                    }}>
                        초자동화 영상 생산 도시
                    </p>
                </div>
            </div>

            {/* Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                    <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#10b981',
                        boxShadow: '0 0 8px #10b981',
                        animation: 'pulse-neon 2s ease-in-out infinite',
                    }} />
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>
                        ONLINE
                    </span>
                </div>
                <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: "'Outfit', monospace",
                    fontWeight: 400,
                }}>
                    {time.toLocaleTimeString('ko-KR')}
                </div>
            </div>
        </header>
    )
}
