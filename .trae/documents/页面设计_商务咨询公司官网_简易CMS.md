# 页面设计文档（Desktop-first）

## 0. Global Styles（全局规范）
- Layout：桌面端优先，最大内容宽度 1200px；主体采用 CSS Grid + Flex 混合；区块间距 24px，卡片内边距 16px。
- 断点：≥1200 桌面三/四列卡片；768–1199 双列；<768 单列(保持可用但不以移动端为主)。
- 色彩Token：
  - Background: #0B1220(深) / #FFFFFF(浅，可选主题切换)
  - Primary: #1E40AF；Accent: #0EA5E9；Border: #E5E7EB
  - Text: #111827 / #6B7280
- 字体：中文优先系统字体；H1 36/44，H2 28/36，Body 16/24，Caption 12/18。
- 按钮：Primary(实心) / Secondary(描边)；hover 提升亮度并加轻微阴影；禁用态 40% 透明度。
- 链接：默认下划线隐藏；hover 显示下划线并变色为 Accent。
- 动效：轮播切换 300ms；弹窗淡入 200ms；减少夸张动画。

---

## 1. 官网首页（/）
### Meta Information
- title：{公司名}｜商务咨询
- description：一句话价值主张 + 主要服务方向
- og:title/description/image：来自后台站点配置或默认

### Page Structure
- 顶部：Header（横向导航 + Logo + “后台”入口(仅登录态显示)）
- 主体：分区纵向堆叠（轮播 -> 公告 -> 精选栏目/项目 -> 关于/优势简述 -> 联系方式）
- 底部：Footer（公司信息、备案/版权位）
- 悬浮：右下角客服入口（全站一致）

### Sections & Components
1) Header
- 左侧 Logo（点击回首页）
- 中部导航：首页 / 服务栏目 / 项目案例 / 联系我们
- 右侧：登录态显示“进入CMS”，否则不展示

2) 首页轮播（Hero Carousel）
- 大图 16:9 或 21:9；覆盖标题与摘要（可选）
- 控件：左右箭头 + 指示点；支持自动轮播与暂停
- 点击整卡跳转 link_url

3) 公告栏（Announcement Strip）
- 模式：横向列表/滚动；默认显示 3–5 条
- 每条：标题 + 日期；点击进入公告详情(复用详情页)

4) 精选栏目/项目
- 栏目：卡片网格（名称、简述、进入列表按钮）
- 项目：卡片网格（封面、标题、摘要、标签）

5) 联系方式区块（Contact Panel）
- 左列：电话/邮箱/地址/工作时间
- 右列：地图链接按钮或二维码位（可选）

6) 客服悬浮入口（Floating CS）
- 形态：圆形按钮 + 文案（桌面端可显示文案）
- 点击：右侧抽屉/弹窗
  - 展示：电话一键复制、邮箱复制、微信号复制/二维码
  - 关闭：Esc/点击遮罩

---

## 2. 栏目/项目列表页（/list/:categorySlug）
### Meta Information
- title：{栏目名}｜{公司名}
- description：栏目简介/默认描述
- og 同上

### Layout
- 顶部与底部继承全站
- 主区：左筛选栏 + 右内容列表（桌面端）；窄屏折叠为顶部筛选条

### Sections & Components
1) 面包屑
- 首页 / 栏目 / 当前栏目

2) 筛选区（Filter Panel）
- 字段：标签(多选)、关键字(输入)
- 操作：清空/应用

3) 列表区（Card List）
- 卡片：封面、标题、摘要、标签、发布时间
- 支持：分页或“加载更多”

---

## 3. 内容详情页（/detail/:contentSlug）
### Meta Information
- title：seo_title 优先，否则 title
- description：seo_description 优先，否则 summary
- og:image：og_image_url 优先，否则 cover_url

### Page Structure
- 顶部：标题区（标题、摘要、标签、发布时间）
- 主体：富内容区（居中 760–860px 阅读宽度）+ 侧栏（可选：目录/相关内容）
- 底部：联系咨询 CTA（联系方式 + 引导按钮）

### Sections & Components
1) 富内容渲染（Rich Content Renderer）
- 渲染 content_html（优先）或 content_json
- 图片：点击可放大预览（桌面端）

2) 相关内容（可选）
- 同栏目下 3 条推荐

3) 客服悬浮入口
- 与首页一致，固定可见

---

## 4. CMS后台（/admin*）
### Meta Information
- title：CMS管理后台｜{公司名}
- description：内容与站点配置管理

### Layout
- 桌面端：左侧侧边栏 + 右侧工作区（CSS Grid）
- 工作区：列表页为表格/卡片混合；编辑页为双栏(内容编辑 + 发布设置)

### Sections & Components
1) 登录页（/admin/login）
- 表单：邮箱、密码
- 状态：登录中、错误提示、成功后跳转后台首页

2) 侧边栏导航
- 内容：栏目、项目/文章、公告
- 运营：轮播、联系方式、客服入口
- 账户：退出登录

3) 内容列表（/admin/content）
- 表格列：标题、类型、栏目、状态(草稿/已发布/下线)、更新时间
- 操作：新建、编辑、预览、发布/撤回、删除(可选)

4) 富内容编辑器（/admin/editor/:type/:id）
- 左侧：标题/摘要/封面上传、富内容编辑区(TipTap)
- 右侧：发布设置（slug、栏目、标签、SEO字段、状态、发布时间）
- 顶部操作条：保存草稿、预览、发布/撤回

5) 站点设置（/admin/settings）
- 联系方式表单：电话/邮箱/地址/工作时间
- 轮播管理：列表排序、上下线、图片上传、跳转链接
- 公告管理：与内容一致但类型固定
- 客服入口：开关、按钮文案、弹窗内容编辑(结构化字段)
