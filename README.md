## 使用情況調查（2026-11-09）

> 本節為 hanlin-edu-tech repo 清理作業的調查紀錄，待負責人確認後決定封存或刪除。

- 調查結論：仍在使用
- 建議處置：保留，理由：正式站 `/event/line/` 目前提供的內容與 2026-09-01 由本 repo GitHub Actions 部署的檔案相同，並被網站共用浮動按鈕、頁尾與聯絡我們頁連結。
- 最後更新：pushedAt 2026-10-28；最後 commit `462f104` 2026-10-28 hotdog929 chore: 升級 Node.js 至 26（CVE-2026-111497） (#11)
- 用途：「聯絡線上客服」LINE 好友 QR Code 頁（pug／sass，gulp 建置），GitHub Actions 依 tag 上傳到 GCS 的 `event/line/`，正式站網址 `https://www.ehanlin.com.tw/event/line/`。

### 檢查結果

| 檢查項目 | 結果 | 依據 |
|---|---|---|
| GitHub 活動 | 最後實質 commit `ef90cee` 2026-09-01 ehanlin（埋入 Google Ads 全站再行銷碼 [sc-121299]，PR #10 由 ivy2846357 合併）；sc-121299 為跨 15 個 repo 的需求，本 repo 已部署到正式站，列為實質開發。2026-05-12 `89ad98b` 為 GTM ID 統一批次修改、2026-10-28 `462f104` 為「升級 Node.js 至 26」批次修改，不列為實質開發。分支 1 個（master）；PR 11 筆皆已合併；issue 0；workflow：production CD（tag `v\d+\.\d+\.\d+`）、test CD（tag `v*-SNAPSHOT`），最近執行 2026-09-01 `v1.1.7`／`v1.1.7-SNAPSHOT` 皆 success；tag 30 個；release 0；非 fork | 已查核，細節記錄於內部調查報告 |
| org 內程式碼引用 | 網站共用元件與現行頁面連結本頁 | 已查核，細節記錄於內部調查報告（關鍵字：event-LinePage、event/line；命中 platform-wc、platform-info-view、tutor-platform-root 等） |
| GCP 部署 | 正式與測試環境 GCS 檔案 2026-09-01 由 Actions 上傳，正式站頁面內容與 GCS 相同；查無 Cloud Build trigger、Cloud Run、GKE workload | 已查核，細節記錄於內部調查報告 |
| AWS 部署 | 查無 | 已查核 4 個帳號的 Lambda、API Gateway（REST／HTTP）、ECR、ECS、EventBridge、SQS、S3、CloudFront 盤點，細節記錄於內部調查報告 |

### 待確認事項
- 殘留 webhook 2 個，細節記錄於內部調查報告，需 repo 管理者確認是否移除。

# event-LinePage
LINE Friends QR Code Page
