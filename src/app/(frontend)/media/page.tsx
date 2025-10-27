import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Media } from '@/payload-types'
import './styles.css'

export default async function MediaPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Mediaコレクションからすべてのメディアを取得
  const mediaResult = await payload.find({
    collection: 'media',
    limit: 50, // 表示件数を制限
    sort: '-createdAt', // 作成日時の新しい順
  })

  const mediaItems = mediaResult.docs as Media[]

  return (
    <div className="media-page">
      <div className="container">
        <header className="page-header">
          <h1>Media Gallery</h1>
          <p>アップロードされたメディアファイルの一覧</p>
          <nav className="breadcrumb">
            <Link href="/" className="breadcrumb-link">
              ホーム
            </Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">メディア</span>
          </nav>
        </header>

        {mediaItems.length === 0 ? (
          <div className="empty-state">
            <p>メディアファイルがまだアップロードされていません。</p>
            <a
              href={`${payloadConfig.routes.admin}/collections/media`}
              className="admin-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              管理画面でメディアをアップロード
            </a>
          </div>
        ) : (
          <>
            <div className="media-stats">
              <p>合計 {mediaResult.totalDocs} 件のメディア</p>
            </div>

            <div className="media-grid">
              {mediaItems.map((media) => (
                <div key={media.id} className="media-card">
                  <div className="media-preview">
                    {media.url && media.mimeType?.startsWith('image/') ? (
                      <Image
                        src={media.url}
                        alt={media.alt}
                        width={media.width || 300}
                        height={media.height || 200}
                        className="media-image"
                        style={{
                          objectFit: 'cover',
                          width: '100%',
                          height: '200px',
                        }}
                      />
                    ) : (
                      <div className="media-placeholder">
                        <span className="file-icon">📁</span>
                        <span className="file-extension">
                          {media.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="media-info">
                    <h3 className="media-title">{media.alt}</h3>

                    <div className="media-details">
                      {media.filename && (
                        <p className="media-filename">
                          <strong>ファイル名:</strong> {media.filename}
                        </p>
                      )}

                      {media.mimeType && (
                        <p className="media-type">
                          <strong>タイプ:</strong> {media.mimeType}
                        </p>
                      )}

                      {media.filesize && (
                        <p className="media-size">
                          <strong>サイズ:</strong> {formatFileSize(media.filesize)}
                        </p>
                      )}

                      {media.width && media.height && (
                        <p className="media-dimensions">
                          <strong>サイズ:</strong> {media.width} × {media.height}px
                        </p>
                      )}

                      <p className="media-date">
                        <strong>作成日:</strong>{' '}
                        {new Date(media.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>

                    {media.url && (
                      <div className="media-actions">
                        <a
                          href={media.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-button"
                        >
                          表示
                        </a>
                        <a href={media.url} download={media.filename} className="download-button">
                          ダウンロード
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {mediaResult.hasNextPage && (
              <div className="pagination">
                <p>さらに多くのメディアがあります。ページネーション機能は今後実装予定です。</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ファイルサイズをフォーマットするヘルパー関数
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i]
}
