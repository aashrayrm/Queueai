-- ============================================================
-- QueueAI — Seed Data (Migration 0002)
-- Inserts businesses, live queue entries, and notifications.
-- Run 0001 first. Idempotent for local/demo Supabase projects.
-- ============================================================

delete from public.notifications;
delete from public.queue_entries;
delete from public.places;

insert into public.places
  (name, category, estimated_wait_time, queue_length, queue_status,
   category_icon, address, hours, rating, reviews, description,
   max_queue, avg_service_minutes, best_time_to_visit, ai_confidence,
   color, bg_gradient, status_label)
values
  ('Cafe Aroma', 'Café', 15, 3, 'moderate',
   '☕', '12 University Avenue, Block A', 'Mon-Sat: 7:00 AM - 9:00 PM', 4.5, 128,
   'A cosy specialty coffee shop known for artisan brews, fresh pastries, and a relaxed work-friendly atmosphere.',
   20, 4, '2:00 PM - 3:30 PM', 92, '#F59E0B', 'linear-gradient(135deg, #FEF3C7, #FDE68A)', 'Moderate Wait'),

  ('QuickCut Salon', 'Salon', 8, 2, 'low',
   '✂️', '45 Market Street, Ground Floor', 'Tue-Sun: 9:00 AM - 7:00 PM', 4.7, 94,
   'A modern walk-in hair salon offering professional haircuts, styling, and grooming services with fast turnaround.',
   10, 14, '10:00 AM - 11:30 AM', 88, '#8B5CF6', 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', 'Short Wait'),

  ('City Clinic', 'Clinic', 35, 7, 'busy',
   '🏥', '7 Health Square, Medical Zone', 'Mon-Fri: 8:00 AM - 6:00 PM', 4.3, 211,
   'A well-equipped general medical clinic providing consultations, routine check-ups, and minor procedure services.',
   12, 11, '8:00 AM - 9:00 AM', 85, '#EF4444', 'linear-gradient(135deg, #FEE2E2, #FECACA)', 'Busy Now'),

  ('Burger Hub', 'Restaurant', 12, 4, 'moderate',
   '🍔', '88 Food Court Lane, Level 2', 'Daily: 11:00 AM - 10:00 PM', 4.6, 305,
   'A trendy gourmet burger joint famous for smash burgers, loaded fries, and craft milkshakes.',
   15, 6, '3:00 PM - 5:00 PM', 90, '#10B981', 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', 'Moderate Wait'),

  ('Bean & Byte Cafe', 'Café', 9, 2, 'low',
   '☕', '22 Tech Park Road, Tower 3', 'Daily: 8:00 AM - 8:30 PM', 4.8, 176,
   'Specialty coffee, quiet charging desks, and breakfast bowls for students, founders, and remote teams.',
   18, 4, '1:30 PM - 3:00 PM', 94, '#0EA5E9', 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', 'Short Wait'),

  ('Glow Studio Salon', 'Salon', 22, 5, 'busy',
   '✂️', '19 Lakeview Arcade, First Floor', 'Mon-Sat: 10:00 AM - 8:00 PM', 4.4, 83,
   'A compact styling studio for haircuts, blowouts, beard trims, and quick grooming appointments.',
   8, 16, '11:00 AM - 12:00 PM', 82, '#EC4899', 'linear-gradient(135deg, #FCE7F3, #FBCFE8)', 'Busy Now'),

  ('GreenCare Dental', 'Clinic', 18, 4, 'moderate',
   '🏥', '5 Wellness Plaza, Suite 204', 'Mon-Sat: 9:00 AM - 5:00 PM', 4.6, 142,
   'Dental consultation and cleaning clinic with scheduled and walk-in slots for minor treatments.',
   14, 10, '9:00 AM - 10:00 AM', 89, '#14B8A6', 'linear-gradient(135deg, #CCFBF1, #99F6E4)', 'Moderate Wait'),

  ('Spice Route Kitchen', 'Restaurant', 28, 9, 'busy',
   '🍽️', '61 Central Mall, Food Court', 'Daily: 12:00 PM - 11:00 PM', 4.5, 267,
   'Fast casual Indian bowls, thalis, and rolls with high lunch and dinner demand.',
   16, 7, '4:00 PM - 6:00 PM', 86, '#F97316', 'linear-gradient(135deg, #FFEDD5, #FED7AA)', 'Busy Now'),

  ('Noodle Nest', 'Restaurant', 10, 3, 'low',
   '🍜', '9 East Street, Shop 6', 'Daily: 11:30 AM - 10:30 PM', 4.7, 198,
   'Quick-service ramen, wok bowls, dumplings, and tea with a compact counter queue.',
   14, 5, '2:30 PM - 4:00 PM', 91, '#6366F1', 'linear-gradient(135deg, #E0E7FF, #C7D2FE)', 'Short Wait'),

  ('CarePlus Diagnostics', 'Clinic', 24, 6, 'moderate',
   '🏥', '31 Health Avenue, Basement Level', 'Mon-Sat: 7:30 AM - 4:30 PM', 4.2, 119,
   'Diagnostics center for blood tests, imaging appointments, and routine health screenings.',
   18, 9, '7:30 AM - 8:30 AM', 84, '#06B6D4', 'linear-gradient(135deg, #CFFAFE, #A5F3FC)', 'Moderate Wait');

-- Insert demo users for testing login
insert into public.users (email, password_hash) values
  ('demo@queueai.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),  -- password: demo123
  ('test@example.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),  -- password: demo123
  ('aarav@email.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),
  ('priya@email.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),
  ('rohan@email.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),
  ('meera@email.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),
  ('sara@email.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e'),
  ('maya@email.com', '$2b$12$z8JvhJ7wQvR0h7p0eL8Aee6xQ7vL0eL8Aee6xQ7vL0eL8AeKK5q5e');

insert into public.queue_entries
  (customer_name, number_of_persons, place_id, queue_number, estimated_wait_time,
   status, position_at_join, expected_service_at, notify_at, joined_at, created_at)
select
  seed.customer_name,
  seed.number_of_persons,
  p.id,
  seed.queue_number,
  seed.estimated_wait_time,
  seed.status,
  seed.position_at_join,
  seed.expected_service_at,
  seed.notify_at,
  seed.joined_at,
  seed.created_at
from (
  values
    ('Aarav Mehta', 1, 'Cafe Aroma', 'C1-001', 8, 'waiting', 1, now() + interval '8 minutes', now() + interval '5 minutes', now() - interval '11 minutes', now() - interval '11 minutes'),
    ('Priya Nair', 2, 'Cafe Aroma', 'C1-002', 13, 'waiting', 2, now() + interval '13 minutes', now() + interval '10 minutes', now() - interval '7 minutes', now() - interval '7 minutes'),
    ('Rohan Shah', 1, 'Cafe Aroma', 'C1-003', 16, 'waiting', 3, now() + interval '16 minutes', now() + interval '13 minutes', now() - interval '2 minutes', now() - interval '2 minutes'),
    ('Meera Iyer', 1, 'QuickCut Salon', 'S2-001', 9, 'waiting', 1, now() + interval '9 minutes', now() + interval '6 minutes', now() - interval '12 minutes', now() - interval '12 minutes'),
    ('Kabir Das', 1, 'QuickCut Salon', 'S2-002', 18, 'waiting', 2, now() + interval '18 minutes', now() + interval '15 minutes', now() - interval '4 minutes', now() - interval '4 minutes'),
    ('Nisha Rao', 1, 'City Clinic', 'M3-001', 10, 'waiting', 1, now() + interval '10 minutes', now() + interval '7 minutes', now() - interval '38 minutes', now() - interval '38 minutes'),
    ('Dev Patel', 3, 'City Clinic', 'M3-002', 22, 'waiting', 2, now() + interval '22 minutes', now() + interval '19 minutes', now() - interval '31 minutes', now() - interval '31 minutes'),
    ('Sara Khan', 1, 'City Clinic', 'M3-003', 31, 'waiting', 3, now() + interval '31 minutes', now() + interval '28 minutes', now() - interval '22 minutes', now() - interval '22 minutes'),
    ('Vikram Bose', 2, 'City Clinic', 'M3-004', 43, 'waiting', 4, now() + interval '43 minutes', now() + interval '40 minutes', now() - interval '15 minutes', now() - interval '15 minutes'),
    ('Tara Singh', 1, 'Burger Hub', 'B4-001', 7, 'waiting', 1, now() + interval '7 minutes', now() + interval '4 minutes', now() - interval '16 minutes', now() - interval '16 minutes'),
    ('Ishaan Roy', 4, 'Burger Hub', 'B4-002', 17, 'waiting', 2, now() + interval '17 minutes', now() + interval '14 minutes', now() - interval '9 minutes', now() - interval '9 minutes'),
    ('Anika Sen', 2, 'Bean & Byte Cafe', 'C5-001', 6, 'waiting', 1, now() + interval '6 minutes', now() + interval '3 minutes', now() - interval '5 minutes', now() - interval '5 minutes'),
    ('Zoya Ali', 1, 'Glow Studio Salon', 'S6-001', 16, 'waiting', 1, now() + interval '16 minutes', now() + interval '13 minutes', now() - interval '22 minutes', now() - interval '22 minutes'),
    ('Neel Verma', 2, 'GreenCare Dental', 'M7-001', 12, 'waiting', 1, now() + interval '12 minutes', now() + interval '9 minutes', now() - interval '17 minutes', now() - interval '17 minutes'),
    ('Maya Kapoor', 3, 'Spice Route Kitchen', 'B8-001', 12, 'waiting', 1, now() + interval '12 minutes', now() + interval '9 minutes', now() - interval '20 minutes', now() - interval '20 minutes'),
    ('Arjun Menon', 1, 'Noodle Nest', 'B9-001', 5, 'waiting', 1, now() + interval '5 minutes', now() + interval '2 minutes', now() - interval '6 minutes', now() - interval '6 minutes'),
    ('Diya Gupta', 1, 'CarePlus Diagnostics', 'M10-001', 11, 'waiting', 1, now() + interval '11 minutes', now() + interval '8 minutes', now() - interval '25 minutes', now() - interval '25 minutes'),
    ('Vikram Sethi', 1, 'Cafe Aroma', 'C1-004', 20, 'waiting', 4, now() + interval '20 minutes', now() + interval '17 minutes', now() - interval '0 minutes', now() - interval '0 minutes'),
    ('Ananya Thakur', 2, 'Burger Hub', 'B4-003', 22, 'waiting', 3, now() + interval '22 minutes', now() + interval '19 minutes', now() - interval '1 minutes', now() - interval '1 minutes'),
    ('Sanjay Deshmukh', 1, 'Bean & Byte Cafe', 'C5-002', 11, 'waiting', 2, now() + interval '11 minutes', now() + interval '8 minutes', now() - interval '3 minutes', now() - interval '3 minutes')
) as seed(customer_name, number_of_persons, place_name, queue_number, estimated_wait_time,
          status, position_at_join, expected_service_at, notify_at, joined_at, created_at)
join public.places p on p.name = seed.place_name;

insert into public.notifications (place_id, type, icon, message, read, created_at)
select id, 'welcome', '👋', 'Welcome back! Live queue data is now loaded from Supabase.', false, now() - interval '2 minutes'
from public.places
where name = 'Cafe Aroma'
union all
select id, 'update', '🟢', 'QuickCut Salon has a short queue right now.', false, now() - interval '1 minute'
from public.places
where name = 'QuickCut Salon'
union all
select id, 'alert', '🔴', 'City Clinic is busy. Book your spot before heading over.', true, now() - interval '4 minutes'
from public.places
where name = 'City Clinic';
