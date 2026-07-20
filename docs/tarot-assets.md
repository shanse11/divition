# RWS 牌面素材

`public/tarot/rws/` 已存放完整 78 张 Rider–Waite–Smith 牌面的 WebP 优化副本；`manifest.json` 提供逐张可审计的来源清单。数据层为每张牌显式写入对应的本地 `image` 路径；客户端仍会在文件加载失败时回退原创抽象牌面。

- 接入来源：[On Your Journey 的 RWS 完整 PDF](https://onyourjourney.co.uk/free-printable-tarot-cards-deck-with-all-78-cards/)；页面说明其 Rider–Waite 包使用 1909 年 Arthur Edward Waite 与 Pamela Colman Smith 的原版、属于 Public Domain。实际下载文件为页面链接的 `Rider-Waite-Tarot-Cards-Printable.pdf`。
- 完整性核验：PDF 为 13 页，提取后恰为 78 张嵌入 PNG；人工抽检牌面为无水印的经典 RWS 牌图。导入脚本对 78 个稳定 card ID 作显式映射，并拒绝数量或重复不匹配的输入。
- 许可边界：这是可访问的备用发布来源，非博物馆/大学馆藏；其关于公版的说明与原始 1909 RWS 作品的公版状态一致。项目未使用现代商业重绘、牌背或额外设计元素。公版不强制署名；为来源透明，建议展示 “Pamela Colman Smith / Arthur Edward Waite，via On Your Journey printable RWS PDF”。

`node scripts/import-rws-pdf.mjs` 可重新下载该备用 PDF，验证 13 页与 78 张嵌入图，转换为 WebP 并写出 manifest。另保留 `node scripts/download-rws-assets.mjs`：在 Wikimedia 连通时可从更高分辨率的 Commons 统一来源重新导入；它会在许可不是 `Public domain`、数量不是 78 或映射不完整时失败。
