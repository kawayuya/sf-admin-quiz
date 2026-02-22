/**
 * エラーメッセージを日本語に翻訳するユーティリティ
 */

const errorTranslations: Record<string, string> = {
  // React エラー
  'Cannot update a component': 'コンポーネントを更新できません',
  'while rendering a different component': 'レンダリング中に別のコンポーネントを更新しようとしました',
  'To locate the bad setState() call': 'setState()の問題を特定するには',
  'follow the stack trace': 'スタックトレースに従ってください',

  // ナビゲーション エラー
  'Navigation state not yet available': 'ナビゲーション状態がまだ利用できません',
  'Cannot navigate before mount': 'マウント前にナビゲートできません',

  // AsyncStorage エラー
  'Failed to load sessions': 'セッションの読み込みに失敗しました',
  'Failed to save session': 'セッションの保存に失敗しました',

  // クイズ エラー
  'useQuiz must be used within QuizProvider': 'useQuizはQuizProvider内で使用してください',
  'No questions available': '利用可能な問題がありません',
  'Invalid answer index': '無効な回答インデックスです',

  // 一般的なエラー
  'Error': 'エラー',
  'Warning': '警告',
  'Success': '成功',
  'Loading': '読み込み中',
  'Failed': '失敗しました',
  'Try again': 'もう一度試してください',
};

/**
 * エラーメッセージを日本語に翻訳
 */
export function translateError(message: string): string {
  // 完全一致を確認
  if (errorTranslations[message]) {
    return errorTranslations[message];
  }

  // 部分一致を確認
  for (const [key, value] of Object.entries(errorTranslations)) {
    if (message.includes(key)) {
      return message.replace(key, value);
    }
  }

  // 翻訳できない場合は元のメッセージを返す
  return message;
}

/**
 * コンソールエラーをインターセプトして日本語化
 */
export function setupErrorHandler() {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function (...args: any[]) {
    const translatedArgs = args.map((arg) => {
      if (typeof arg === 'string') {
        return translateError(arg);
      }
      return arg;
    });
    originalError.apply(console, translatedArgs);
  };

  console.warn = function (...args: any[]) {
    const translatedArgs = args.map((arg) => {
      if (typeof arg === 'string') {
        return translateError(arg);
      }
      return arg;
    });
    originalWarn.apply(console, translatedArgs);
  };
}

/**
 * エラーオブジェクトを日本語メッセージに変換
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return translateError(error.message);
  }
  if (typeof error === 'string') {
    return translateError(error);
  }
  return '予期しないエラーが発生しました';
}
