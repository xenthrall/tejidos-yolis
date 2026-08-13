-- categories

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- products

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories (id) on delete set null,
  image_path text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index products_is_published_idx on public.products (is_published) where is_published = true;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- row level security
-- no roles table: every account is created manually (Supabase dashboard) for
-- the store's own family/staff, so any authenticated user is treated as admin.

alter table public.categories enable row level security;
alter table public.products enable row level security;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

create policy "categories are publicly readable"
on public.categories
for select
to anon, authenticated
using (true);

create policy "authenticated users insert categories"
on public.categories
for insert
to authenticated
with check (true);

create policy "authenticated users update categories"
on public.categories
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users delete categories"
on public.categories
for delete
to authenticated
using (true);

create policy "products are readable when published or by authenticated users"
on public.products
for select
to anon, authenticated
using (is_published = true or (select auth.uid()) is not null);

create policy "authenticated users insert products"
on public.products
for insert
to authenticated
with check (true);

create policy "authenticated users update products"
on public.products
for update
to authenticated
using (true)
with check (true);

create policy "authenticated users delete products"
on public.products
for delete
to authenticated
using (true);

-- storage: product images

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "authenticated users upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images');

create policy "authenticated users update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

create policy "authenticated users delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images');
