-- Migration 004: Seed Team & Track Record data
-- Run after 003_team_track_record.sql

-- ============================================
-- TEAM MEMBERS
-- ============================================
INSERT INTO team_members (name, title, subtitle, entity, email, sort_order, display_section) VALUES
('Spencer Gray', 'Co-Founder, CEO', NULL, 'Gray Capital', NULL, 1, 'leadership'),
('Alex Gray', 'Co-Founder', 'President, Gray Construction & Design', 'Gray Capital', NULL, 2, 'leadership'),
('Jay Reeder', 'Chief Investment Officer', NULL, 'Gray Capital', NULL, 3, 'leadership'),
('Andrew Bosway', 'Chief Operating Officer', NULL, 'Gray Capital', NULL, 4, 'leadership'),
('Katrina Greene', 'Director of Property Management', NULL, 'Gray Residential', NULL, 5, 'leadership'),
('Joe Powell', 'Director of Facilities', NULL, 'Gray Residential', NULL, 6, 'leadership'),
('Blake Pieroni', 'Head of Investor Relations', NULL, 'Gray Capital', 'Blake@graycapitalllc.com', 7, 'leadership'),
('Matt Bastnagel', 'Director, Marketing & Communications', NULL, 'Gray Capital', NULL, 8, 'leadership'),
('Blake Pieroni', 'Head of Investor Relations', NULL, 'Gray Capital', 'Blake@graycapitalllc.com', 1, 'ir'),
('Griffin Haddad', 'Investment Associate', NULL, 'Gray Capital', 'Griffin@graycapitalllc.com', 2, 'ir');

-- ============================================
-- TRACK RECORD — REALIZED (Full-Cycle)
-- ============================================
INSERT INTO track_record (project_name, market, entry_date, exit_date, net_irr, net_equity_multiple, status, sort_order) VALUES
('Abbey Court', 'Evansville, IN', '2017-08-01', '2021-12-01', 38, 3.44, 'realized', 1),
('Lexington Green / Villa Capri', 'Speedway, IN', '2016-09-01', '2020-10-01', 26, 2.33, 'realized', 2),
('Fountain Parc', 'Indianapolis, IN', '2018-01-01', '2021-09-01', 31, 2.39, 'realized', 3),
('Walnut Manor', 'Muncie, IN', '2017-02-01', '2020-09-01', 23, 1.70, 'realized', 4),
('Carmel Woods', 'Carmel, IN', '2018-12-01', '2022-06-01', 33, 2.54, 'realized', 5),
('Fox Brooke', 'Muncie, IN', '2018-02-01', '2020-09-01', 23, 1.70, 'realized', 6),
('The Reserve', 'Evansville, IN', '2019-07-01', '2022-05-01', 28, 2.00, 'realized', 7),
('Pinnacle on Meridian', 'Indianapolis, IN', '2020-11-01', '2022-10-01', 38, 1.90, 'realized', 8),
('Pebble Brook', 'Noblesville, IN', '2020-11-01', '2023-02-01', 31, 1.90, 'realized', 9),
('Autumn Trails', 'Indianapolis, IN', '2020-09-01', '2024-08-01', 22, 1.75, 'realized', 10);

-- ============================================
-- TRACK RECORD — ACTIVE
-- ============================================
INSERT INTO track_record (project_name, market, acquired, cash_on_cash, strategy, status, is_fund_asset, sort_order) VALUES
('Oakdale Square', 'Bloomington, IN', '2017-01-01', 12, 'Value-Add', 'active', FALSE, 11),
('Mad River', 'Dayton, OH', '2017-11-01', 9, 'Value-Add', 'active', FALSE, 12),
('Gateway Crossing', 'McCordsville, IN', '2018-07-01', 13, 'Core Plus', 'active', FALSE, 13),
('Nantucket Cove', 'Champaign, IL', '2018-12-01', 7.5, 'Core Plus', 'active', FALSE, 14),
('Greenfield Crossing', 'Greenfield, IN', '2019-12-01', 7.5, 'Value-Add', 'active', FALSE, 15),
('Aberdeen', 'Camby, IN', '2020-11-01', 7.5, 'Core Plus', 'active', FALSE, 16),
('Villas on Fir', 'Granger, IN', '2020-12-01', 15, 'Core Plus', 'active', FALSE, 17),
('Waterstone', 'Evansville, IN', '2021-02-01', 7.5, 'Value-Add', 'active', FALSE, 18),
('Suncrest', 'Indianapolis, IN', '2021-08-01', 8, 'Value-Add', 'active', FALSE, 19),
('Forest Ridge', 'Bloomington, IN', '2021-12-01', 7, 'Value-Add', 'active', FALSE, 20),
('Park 88', 'Des Moines, IA', '2022-03-01', 7.5, 'Value-Add', 'active', FALSE, 21),
('Crosswinds', 'Indianapolis, IN', '2022-05-01', 4, 'Value-Add', 'active', TRUE, 22),
('Club Meridian', 'Okemos, MI', '2022-06-01', 6, 'Value-Add', 'active', TRUE, 23),
('Sycamore Terrace', 'Terre Haute, IN', '2022-12-01', 6, 'Value-Add', 'active', TRUE, 24),
('Echo Park', 'Bloomington, IN', '2023-02-01', 5, 'Core Plus', 'active', TRUE, 25),
('River Club', 'Evansville, IN', '2024-04-01', 6, 'Value-Add', 'active', FALSE, 26),
('Solana at the Crossing', 'Indianapolis, IN', '2024-08-01', 6, 'Core Plus', 'active', FALSE, 27);

-- ============================================
-- CASE STUDIES
-- ============================================
INSERT INTO case_studies (project_name, strategy, market, units, year_built, purchase_price, cash_on_cash, irr, hold_period, narrative, stats, sort_order) VALUES
(
  'Villas on Fir',
  'Core-Plus',
  'Granger, IN (South Bend / Mishawaka area)',
  290,
  2018,
  61250000,
  15,
  '30%+ (Projected)',
  '10 years',
  'An A-Class, Core+ asset located in the heart of an overlooked, growing, high-income, tertiary market in our home state. The acquisition of Villas on Fir highlights our ability to source attractive deals often overlooked in "flyover" markets unrecognized by larger and/or coastal investment firms. Acquired in 2020, at the onset of a global pandemic, this project exhibits our understanding of, and willingness to quantify and take appropriate risks during uncertain times and in markets that are often overlooked. The keystone to our success is our ability to implement operational efficiencies aimed to directly drive returns — producing an average CoC of 15%.',
  '{"price_per_unit": 211207}',
  1
),
(
  'Club Meridian',
  'Value-Add',
  'Okemos, MI (Lansing area)',
  406,
  1989,
  70500000,
  7,
  NULL,
  'Ongoing',
  'Club Meridian is a 406-unit, B-class, value-add multifamily asset in Okemos, Michigan. Since acquisition, NOI has increased by 27.5%, driven by operational efficiencies and strategic upgrades to common areas, building entryways, and select unit interiors, including appliance and flooring enhancements. Purchased at $174,000 per unit, the property exemplifies Gray Capital''s ability to generate value through both physical improvements and operational efficiencies, leading to increased cash flow distributions and asset appreciation.',
  '{"noi_increase": "27.5%", "price_per_unit": 174000, "acquired": "06/2022"}',
  2
);

-- ============================================
-- TESTIMONIALS
-- ============================================
INSERT INTO testimonials (name, attribution, quote, sort_order) VALUES
('Robert McDonald', 'Gray Capital Investor', 'Fantastic reporting! Another syndication I''m an LP with provides a single email with a brief update. Your updates and reporting are top shelf.', 1),
('Cathi Scalise', 'Gray Capital Investor', 'I am very happy with my Gray Fund investment! Thoughtful strategy and solid returns. I appreciate the regular updates, on-time distributions, and the overall communication from the principals.', 2);
