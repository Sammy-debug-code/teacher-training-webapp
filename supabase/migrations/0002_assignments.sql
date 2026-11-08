-- Module visibility. A module is visible to a teacher if module.json marks it default,
-- or if a row exists here. Run once in the SQL editor.
create table if not exists module_assignments (
  teacher_id  uuid not null references teachers(id) on delete cascade,
  module_id   text not null,
  assigned_at timestamptz not null default now(),
  primary key (teacher_id, module_id)
);
alter table module_assignments enable row level security;
