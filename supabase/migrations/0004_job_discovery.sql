-- Seed initial locations
INSERT INTO locations (name, slug) VALUES 
('Chennai', 'chennai'),
('OMR', 'omr'),
('Sholinganallur', 'sholinganallur'),
('Navalur', 'navalur'),
('Siruseri', 'siruseri'),
('Kelambakkam', 'kelambakkam')
ON CONFLICT (slug) DO NOTHING;

-- Seed some basic categories
INSERT INTO job_categories (name, slug) VALUES 
('Software Engineering', 'software-engineering'),
('Data Science & Analytics', 'data-science'),
('UI/UX Design', 'design'),
('Product Management', 'product-management'),
('QA & Testing', 'qa-testing'),
('IT Support', 'it-support')
ON CONFLICT (slug) DO NOTHING;
