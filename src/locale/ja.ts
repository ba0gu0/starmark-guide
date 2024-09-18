export default {
  message: {
    hello: 'こんにちは',
  },
  popup: {
    title: 'スターマークガイド',
    search: {
      placeholder: '検索...',
    },
    topRecords: '最近の記録',
    recentRecords: 'よく訪れるサイト',
    searchResults: '検索結果',
    homeButton: 'ホーム',
    optionButton: '設定'
  },
  options: {
    title: '設定',
    plugin: {
      title: 'プラグイン設定',
      language: {
        title: '言語',
        hint: 'プラグインインターフェースの言語を選択',
        zhCN: '簡体字中国語',
        zhTW: '繁体字中国語',
        enUS: '英語',
        es: 'スペイン語',
        ptPT: 'ポルトガル語',
        th: 'タイ語',
        ja: '日本語',
        ko: '韓国語',
        it: 'イタリア語',
        ms: 'マレー語',
        id: 'インドネシア語',
        ar: 'アラビア語',
        fr: 'フランス語',
        de: 'ドイツ語',
        vi: 'ベトナム語',
        km: 'クメール語',
      },
      popupAction: {
        title: 'ポップアップアクション',
        hint: '拡張機能アイコンをクリックしたときのデフォルトの動作を設定',
        search: 'ポップアップタブを開く',
        newTab: 'ホームタブを開く',
      },
      screenshotCache: {
        title: 'ページのスクリーンショットをキャッシュ',
        enable: 'ページのスクリーンショットのキャッシュを有効にする',
        hint: 'ページのスクリーンショットをキャッシュするかどうか。有効にするとホームページにウェブページのプレビューが表示されますが、より多くのストレージスペースを占有します',
      },
    },
    model: {
      title: 'モデル設定',
      aiModelProviderHint: 'AIモデルプロバイダーを選択',
      aiModelTypeHint: 'AIモデルタイプを選択',
      customModelUrlHint: 'カスタムモデルURL（オプション）',
      customModelUrlPlaceholder: 'カスタムモデルURLを入力',
      modelKeyHint: 'モデルAPIキー',
      modelKeyPlaceholder: 'APIキーを入力',
      checkModelSettings: '確認',
      modelSettingsCheckSuccess: 'Chat AI APIキーの検証に成功しました。',
      modelSettingsCheckFailed: 'Chat AI APIキーの検証に失敗しました。キーとURLの設定が正しいか確認してください。',
      jinaKey: {
        title: 'Jina APIキー',
        hint: 'Jina APIキーを入力（オプション）',
        placeholder: 'Jina APIキー',
        checkSuccess: 'Jina AI APIキーの検証に成功しました',
        checkFailed: 'Jina AI APIキーの検証に失敗しました',
      },
      firecrawlKey: {
        title: 'Firecrawl APIキー',
        hint: 'Firecrawl APIキーを入力してください',
        placeholder: 'Firecrawl APIキーを入力',
        checkSuccess: 'Firecrawl APIキーの検証に成功しました',
        checkFailed: 'Firecrawl APIキーの検証に失敗しました',
      },
    },
    crawl: {
      title: 'データ分類',
      pageTitle: 'データ分類 - スターマークガイド',
      progressText: '進捗：{current}/{total}',
      startCrawl: '分類開始',
      continueCrawl: '分類続行',
      language: '言語',
      source: 'ソース',
      success: '成功',
      failed: '失敗',
      crawling: '分類中...',
      successMessage: '分類に成功しました',
      errorMessage: '分類に失敗しました',
      unknownError: '不明なエラー',
      rateLimit: 'レート制限',
      rateLimitHint: 'ウェブサイトのレート制限により、1分間に最大5リクエストまで許可されています。制限を超えた場合、次の利用可能時間枠まで自動的に待機します。',
      wait: 'お待ちください',
      waitMessage: 'レート制限期間が過ぎるまでお待ちください。',
      control: '分類制御',
      controlHint: '分類プロセスを開始または停止',
      stopCrawl: '分類停止',
      results: '分類結果',
      resultsPlaceholder: 'データなし',
      status: 'ステータス',
      crawlComplete: 'クローリング完了',
      crawlError: '分類中にエラーが発生しました',
      crawlStopped: '分類が停止しました',
      aiStream: 'AI Chat 流',
      aiStreamPlaceholder: 'データなし',
      updateMode: "更新モード",
      updateAll: "すべて更新",
      updateNew: "新規のみ更新",
      updateAllDescription: "既に分類されたページを含む、すべてのウェブページのデータを更新します。",
      updateNewDescription: "まだ分類されていないウェブページのデータのみを分類します。",
      crawlingResultTitle: '分類中...',
    },
  },
  home: {
    title: 'スターマークガイド',
  },
};
