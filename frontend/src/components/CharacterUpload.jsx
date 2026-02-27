import { useState, useCallback } from 'react'

/**
 * 🛂 CharacterUpload - 입국 심사대
 * 드래그 & 드롭 캐릭터 이미지 업로드
 */
export default function CharacterUpload({ onFileSelect, selectedFile }) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [preview, setPreview] = useState(null)

    const handleFile = useCallback((file) => {
        if (!file || !file.type.startsWith('image/')) return
        onFileSelect(file)
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(file)
    }, [onFileSelect])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer.files?.[0]
        handleFile(file)
    }, [handleFile])

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false)
    }, [])

    const handleInputChange = useCallback((e) => {
        const file = e.target.files?.[0]
        handleFile(file)
    }, [handleFile])

    const removeFile = useCallback(() => {
        onFileSelect(null)
        setPreview(null)
    }, [onFileSelect])

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            {/* Section Title */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>🛂</span>
                <div>
                    <h3 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                    }}>
                        입국 심사대
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        캐릭터 이미지를 등록하세요 (선택사항)
                    </p>
                </div>
            </div>

            {!preview ? (
                <div
                    className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('char-upload').click()}
                >
                    <input
                        type="file"
                        id="char-upload"
                        accept="image/*"
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                    />

                    <div style={{
                        fontSize: '2.5rem',
                        marginBottom: '12px',
                        opacity: 0.6,
                    }}>
                        {isDragOver ? '📥' : '👤'}
                    </div>

                    <p style={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: isDragOver ? 'var(--color-neon-blue)' : 'var(--color-text-secondary)',
                        marginBottom: '6px',
                    }}>
                        {isDragOver ? '여기에 놓으세요!' : '드래그 & 드롭 또는 클릭하여 업로드'}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        PNG, JPG, WEBP (최대 10MB)
                    </p>
                </div>
            ) : (
                <div style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                }}>
                    <img
                        src={preview}
                        alt="캐릭터 미리보기"
                        style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                    {/* Overlay with file info */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '12px 16px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                ✅ {selectedFile?.name}
                            </p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeFile() }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                            }}
                        >
                            제거
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
