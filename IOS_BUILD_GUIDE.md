# iOS ビルド・App Store 公開ガイド

**Salesforce Admin Quiz を Apple App Store に公開するための完全ガイド**

---

## 前提条件

本ガイドに従う前に、以下の準備が完了していることを確認してください。

### 必須アカウント

1. **Apple Developer Account**（年間 $99）
   - https://developer.apple.com/ で登録
   - Apple ID が必要

2. **App Store Connect アカウント**
   - https://appstoreconnect.apple.com/ でログイン
   - Apple Developer Account と同じ Apple ID で登録

### 必須ツール

- **Xcode 14.0 以上**：macOS で実行（Windows では不可）
- **Node.js 18.0 以上**
- **EAS CLI**：Expo Application Services のコマンドラインツール
- **Git**：バージョン管理

### 開発環境

- **macOS 12.0 以上**
- **iOS 14.0 以上**対応のテストデバイス（推奨）

---

## ステップ 1：EAS CLI のセットアップ

### 1.1 EAS CLI のインストール

```bash
npm install -g eas-cli
```

### 1.2 Expo アカウントでログイン

```bash
eas login
```

Expo アカウントの認証情報を入力してください。

### 1.3 プロジェクトの初期化

```bash
cd /home/ubuntu/sf-admin-quiz
eas build:configure
```

このコマンドで、EAS ビルド用の設定ファイル（`eas.json`）が生成されます。

---

## ステップ 2：ビルド設定の確認

### 2.1 eas.json の確認

プロジェクトルートの `eas.json` ファイルを確認してください。以下のような構造が必要です：

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "simulator"
      }
    },
    "preview2": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "simulator"
      }
    },
    "preview3": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "simulator"
      }
    },
    "production": {
      "ios": {
        "buildType": "ipa"
      }
    }
  }
}
```

### 2.2 app.config.ts の確認

`app.config.ts` ファイルで以下の項目を確認してください：

| 項目 | 値 |
|------|-----|
| name | Salesforce Admin Quiz |
| slug | sf-admin-quiz |
| version | 1.0.0 |
| ios.bundleIdentifier | space.manus.sf.admin.quiz.t20260222082154 |
| icon | ./assets/images/icon.png |

---

## ステップ 3：iOS ビルドの実行

### 3.1 本番環境用 IPA ファイルの生成

```bash
eas build --platform ios --build-type ipa
```

このコマンドで、Apple App Store 提出用の IPA ファイルが生成されます。

**処理時間**：通常 15～30 分

### 3.2 ビルドの進行状況確認

```bash
eas build:list
```

ビルドの状態を確認できます。

### 3.3 ビルド完了後

ビルドが完了すると、以下の情報が表示されます：

- **Build ID**：ビルドの一意識別子
- **IPA URL**：生成された IPA ファイルのダウンロードリンク
- **Build Status**：ビルドの状態（成功/失敗）

IPA ファイルをダウンロードしてください。

---

## ステップ 4：App Store Connect での登録

### 4.1 アプリの新規登録

1. **App Store Connect にログイン**
   - https://appstoreconnect.apple.com/

2. **「My Apps」をクリック**

3. **「+」ボタンをクリック** → 「New App」を選択

4. **以下の情報を入力**

   | 項目 | 値 |
   |------|-----|
   | Platform | iOS |
   | Name | Salesforce Admin Quiz |
   | Primary Language | Japanese |
   | Bundle ID | space.manus.sf.admin.quiz.t20260222082154 |
   | SKU | sf-admin-quiz-001 |

5. **「Create」をクリック**

### 4.2 アプリ情報の入力

#### 4.2.1 一般情報

**App Information セクション：**

- **App Name**：Salesforce Admin Quiz
- **Subtitle**：Salesforce 認定管理者試験対策アプリ
- **Primary Category**：教育
- **Secondary Category**：仕事効率化（オプション）

#### 4.2.2 説明文

**Localization セクション：**

1. **Japanese を選択**

2. **以下を入力**

   - **Description**：
     ```
     Salesforce Admin Quiz は、Salesforce 認定管理者試験の合格を目指すための学習アプリです。

     【主な機能】
     • 250問以上の過去問を収録
     • 4つのカテゴリ別学習（ユーザー管理、データ管理、セキュリティ、設定）
     • 各問題に詳細な解説を掲載
     • 即座にフィードバック機能で弱点を把握
     • スコア履歴と成績分析で学習進度を追跡
     • 苦手克服モードで重点学習に対応

     このアプリで効率的に学習し、Salesforce 認定管理者試験の合格を目指しましょう！
     ```

   - **Keywords**：Salesforce, 認定管理者試験, 資格試験, 学習, クイズ, 過去問

   - **Support URL**：support@salesforceadminquiz.com

   - **Privacy Policy URL**：https://github.com/kawayuya/sf-admin-quiz/blob/main/PRIVACY_POLICY.md

#### 4.2.3 スクリーンショット

1. **Screenshots セクション**

2. **各デバイスサイズに対応したスクリーンショットをアップロード**

   - **5.5-inch Display**（iPhone 8 Plus）：5 枚
   - **6.5-inch Display**（iPhone 11 Pro Max）：5 枚

3. **スクリーンショットの説明**（各スクリーンショット下）

   - スクリーンショット 1：「ホーム画面 - クイズ開始」
   - スクリーンショット 2：「クイズ問題 - 選択肢から回答」
   - スクリーンショット 3：「結果画面 - スコアと成績分析」
   - スクリーンショット 4：「統計画面 - 学習進度追跡」

#### 4.2.4 プレビュー画像

1. **App Preview セクション**

2. **アプリの動作を示すビデオを作成**（オプション）

   - 推奨：15～30 秒
   - 形式：MOV または MP4

---

## ステップ 5：ビルド情報の入力

### 5.1 TestFlight ビルドのアップロード

1. **Xcode または Transporter を使用して IPA をアップロード**

#### Transporter を使用する場合

```bash
# Transporter のインストール
brew install transporter

# IPA ファイルのアップロード
transporter upload /path/to/build.ipa
```

#### Xcode を使用する場合

1. Xcode を開く
2. **Window** → **Organizer** を選択
3. **Uploads** タブをクリック
4. **+** ボタンをクリック
5. IPA ファイルを選択

### 5.2 ビルド情報の確認

App Store Connect で以下を確認：

- **Build Version**：1.0.0
- **Build Number**：1
- **iOS Minimum Version**：14.0

---

## ステップ 6：App Store 審査用情報の入力

### 6.1 価格と販売地域

1. **Pricing and Availability セクション**

2. **Price Tier**：無料（Free）を選択

3. **Availability**：
   - 日本を含む対応国を選択
   - または「All Regions」を選択

### 6.2 年齢制限

**Age Rating セクション：**

1. **「Edit」をクリック**

2. **以下の項目に「None」を選択**

   - 暴力
   - 成人向けコンテンツ
   - ギャンブル
   - アルコール・タバコ

3. **「Save」をクリック**

### 6.3 コンテンツ権利

**App Review Information セクション：**

1. **「Does your app use encryption?」** → 「No」

2. **「Does your app contain, require, or use third-party sign-in?」** → 「Yes」（OAuth を使用する場合）

3. **「Does your app use the Advertising Identifier (IDFA)?」** → 「No」

### 6.4 App Review Notes

**App Review Information セクション：**

以下の情報を入力：

```
アプリ名：Salesforce Admin Quiz
説明：Salesforce 認定管理者試験対策アプリ

テスト用アカウント：
メールアドレス：test@example.com
パスワード：TestPassword123!

特別な指示：
- アプリはオフラインで使用可能です
- ユーザー認証は Google OAuth、Microsoft OAuth、またはメールアドレスで行えます
- 初回起動時に利用規約とプライバシーポリシーの同意が必要です
```

---

## ステップ 7：App Store 審査への提出

### 7.1 審査版の準備

1. **App Store Connect にログイン**

2. **Salesforce Admin Quiz アプリを選択**

3. **「App Store」タブをクリック**

4. **「Version」セクションで以下を確認**

   - [ ] アプリ名が正確
   - [ ] 説明文が正確
   - [ ] スクリーンショットが表示されている
   - [ ] プライバシーポリシー URL が設定されている
   - [ ] サポート URL が設定されている
   - [ ] ビルドが選択されている

### 7.2 審査への提出

1. **「Build」セクション**

2. **IPA ビルドを選択**

3. **「Submit for Review」をクリック**

4. **確認画面で「Submit」をクリック**

### 7.3 審査状況の確認

1. **App Store Connect で「Version」を確認**

2. **Status が「Waiting for Review」に変更**

3. **通常 24～48 時間で審査が完了**

---

## ステップ 8：公開

### 8.1 審査合格後

1. **App Store Connect で Status を確認**

2. **Status が「Ready for Sale」に変更**

3. **「Release」セクションで公開日を選択**

   - **Automatic Release**：審査合格後、自動公開
   - **Manual Release**：手動で公開日を指定

### 8.2 App Store での確認

1. **App Store で「Salesforce Admin Quiz」を検索**

2. **アプリが表示されることを確認**

3. **ダウンロード可能であることを確認**

---

## トラブルシューティング

### ビルドエラー

**エラー：「Pod install failed」**

```bash
cd ios
rm -rf Pods
pod install
cd ..
```

**エラー：「Code signing failed」**

1. Xcode で Signing Certificate を確認
2. Apple Developer Account で Certificate を再生成
3. Keychain に Certificate をインポート

### App Store 審査での却下

**よくある却下理由：**

1. **プライバシーポリシーが不明確**
   - プライバシーポリシーを詳細に記載

2. **テスト用アカウント情報が不足**
   - App Review Notes に詳細なテスト手順を記載

3. **クラッシュやバグ**
   - TestFlight でテストして修正

4. **ガイドライン違反**
   - App Store Review Guidelines を確認

---

## 参考資料

- **Expo EAS Build ドキュメント**：https://docs.expo.dev/build/introduction/
- **App Store Connect ヘルプ**：https://help.apple.com/app-store-connect/
- **App Store Review Guidelines**：https://developer.apple.com/app-store/review/guidelines/
- **Xcode ドキュメント**：https://developer.apple.com/xcode/

---

**最終更新日：2026年3月13日**

**質問やサポートが必要な場合は、support@salesforceadminquiz.com までお問い合わせください。**
