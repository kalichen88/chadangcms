create extension if not exists pgcrypto;

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  work_time text not null default '',
  cs_button_text text not null default '在线咨询',
  cs_popup_json jsonb not null default '{}'::jsonb,
  updated_by text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  code_prefix text not null default 'A',
  sort_order int not null default 0,
  is_published boolean not null default true,
  show_on_home boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_categories_sort on categories(sort_order);

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  code text unique not null,
  title text not null,
  slug text unique not null,
  price_text text not null default '',
  summary text not null default '',
  cover_url text not null default '',
  category_id text not null default '',
  tags_csv text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  og_image_url text not null default '',
  content_json jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_type_pub on content_items(type, is_published);
create index if not exists idx_content_category on content_items(category_id);

create table if not exists carousel_items (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  image_url text not null,
  link_url text not null default '',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_carousel_sort on carousel_items(sort_order);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content_json jsonb not null default '{}'::jsonb,
  content_html text not null default '',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_announce_pub on announcements(is_published, published_at desc);

alter table site_settings enable row level security;
alter table categories enable row level security;
alter table content_items enable row level security;
alter table carousel_items enable row level security;
alter table announcements enable row level security;

drop policy if exists site_settings_public_read on site_settings;
create policy site_settings_public_read on site_settings
for select to anon
using (true);

drop policy if exists site_settings_auth_all on site_settings;
create policy site_settings_auth_all on site_settings
for all to authenticated
using (true)
with check (true);

drop policy if exists categories_public_read on categories;
create policy categories_public_read on categories
for select to anon
using (is_published = true);

drop policy if exists categories_auth_all on categories;
create policy categories_auth_all on categories
for all to authenticated
using (true)
with check (true);

drop policy if exists content_public_read on content_items;
create policy content_public_read on content_items
for select to anon
using (is_published = true);

drop policy if exists content_auth_all on content_items;
create policy content_auth_all on content_items
for all to authenticated
using (true)
with check (true);

drop policy if exists carousel_public_read on carousel_items;
create policy carousel_public_read on carousel_items
for select to anon
using (is_published = true);

drop policy if exists carousel_auth_all on carousel_items;
create policy carousel_auth_all on carousel_items
for all to authenticated
using (true)
with check (true);

drop policy if exists announcements_public_read on announcements;
create policy announcements_public_read on announcements
for select to anon
using (is_published = true);

drop policy if exists announcements_auth_all on announcements;
create policy announcements_auth_all on announcements
for all to authenticated
using (true)
with check (true);

grant select on site_settings to anon;
grant select on categories to anon;
grant select on content_items to anon;
grant select on carousel_items to anon;
grant select on announcements to anon;

grant all privileges on site_settings to authenticated;
grant all privileges on categories to authenticated;
grant all privileges on content_items to authenticated;
grant all privileges on carousel_items to authenticated;
grant all privileges on announcements to authenticated;

insert into site_settings (company_name, phone, email, address, work_time, cs_button_text, cs_popup_json)
select
  '商务咨询公司',
  '400-000-0000',
  'hello@example.com',
  '某某市某某区某某路 88 号',
  '周一至周五 9:00-18:00',
  '在线咨询',
  '{"items":[{"label":"电话","value":"400-000-0000"},{"label":"微信","value":"WeChatID"},{"label":"邮箱","value":"hello@example.com"}]}'::jsonb
where not exists (select 1 from site_settings);

insert into categories (name, slug, code_prefix, sort_order, is_published, show_on_home)
select * from (
  values
    ('商务咨询服务', 'services', 'A', 10, true, true),
    ('咨询案例', 'cases', 'B', 20, true, true),
    ('报价与方案', 'pricing', 'C', 30, true, true)
) as v(name, slug, code_prefix, sort_order, is_published, show_on_home)
where not exists (select 1 from categories);

insert into carousel_items (title, image_url, link_url, sort_order, is_published)
select * from (
  values
    ('欢迎访问商务咨询官网', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20business%20consulting%20hero%20banner%2C%20dark%20navy%20and%20blue%20gradient%2C%20clean%20corporate%20style%2C%20abstract%20geometric%20shapes%2C%20high%20quality%2C%2016%3A9&image_size=landscape_16_9', '/list/services', 10, true),
    ('可配置轮播与富内容详情', 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=clean%20cms%20dashboard%20abstract%20illustration%2C%20blue%20accent%2C%20minimal%2C%2016%3A9&image_size=landscape_16_9', '/admin/login', 20, true)
) as v(title, image_url, link_url, sort_order, is_published)
where not exists (select 1 from carousel_items);

insert into announcements (title, slug, content_json, content_html, is_published, published_at)
select * from (
  values
    (
      '公告：支持后台编辑轮播、公告与内容详情',
      'announcement-1',
      '{"blocks":[{"id":"b1","type":"text","text":"欢迎访问官网。本公告可在后台编辑发布。"}]}'::jsonb,
      '',
      true,
      now()
    )
) as v(title, slug, content_json, content_html, is_published, published_at)
where not exists (select 1 from announcements);

insert into content_items (type, code, title, slug, price_text, summary, cover_url, category_id, tags_csv, content_json, is_published, published_at)
select
  'project',
  'A001',
  '示例项目：企业商业计划书辅导',
  'demo-project-1',
  '¥ 9,800 起',
  '提供从结构梳理到落地表达的一站式辅导服务。',
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=modern%20business%20meeting%2C%20consultant%20presentation%2C%20clean%20corporate%20photo%20style%2C%20soft%20light%2C%2016%3A9&image_size=landscape_16_9',
  (select id::text from categories where slug='services' limit 1),
  '商业计划书,融资,咨询',
  '{"blocks":[{"id":"t1","type":"text","text":"\u672c\u9879\u76ee\u652f\u6301\u56fe\u6587\u3001\u89c6\u9891\u4e0e\u6587\u5b57\u6bb5\u843d\u7ed3\u5408\u7684\u8be6\u60c5\u9875\u5185\u5bb9\u3002"},{"id":"i1","type":"image","url":"https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=clean%20corporate%20chart%20abstract%2C%20blue%20accent%2C%20minimal%2C%20high%20quality&image_size=landscape_16_9"},{"id":"v1","type":"video","url":"https://www.youtube.com/embed/dQw4w9WgXcQ"}]}'::jsonb,
  true,
  now()
where not exists (select 1 from content_items);

