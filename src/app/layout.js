export const metadata = {
  title: 'ビジョン税理士法人 新人研修テスト',
  description: '新卒研修テスト・回答・採点アプリ',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "'Noto Sans JP', sans-serif", background: '#F5F3EF' }}>
        {children}
      </body>
    </html>
  )
}
