-- Creates Sam's admin account. Run once after 0001_init.sql.
insert into teachers (username, display_name, pin_hash, section, is_admin)
values ('sam', 'Sam Sanderson', '$2b$10$DFQ4C/0nzDxogMhXj/Il/OF6rHuMINMFouVC.8kcPd/9Poxc0KKQy', 'senior', true)
on conflict (username) do nothing;
