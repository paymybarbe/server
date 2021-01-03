CREATE TYPE ORDER_STATUS AS ENUM (
  'Remboursée',
  'Validée',
  'En Attente'
);

CREATE TYPE PLANNING_STATUS AS ENUM (
  'En Attente',
  'Validé',
  'Absent avec excuses',
  'Absent sans excuses'
);

CREATE TYPE CASH_FUNDS_OPERATIONS_TYPE AS ENUM (
  'Exceptionnelle',
  'Ordinaire'
);

CREATE TYPE TRANSACTION_MEANS AS ENUM (
  'Carte Bleue',
  'Chèque',
  'Liquide',
  'Points',
  'Lydia',
  'Versement'
);

CREATE TYPE TRANSACTION_TYPE AS ENUM (
  'Service',
  'Cadeau',
  'Rechargement',
  'Remboursement',
  'Achat',
  'Remboursement Essence',
  'Solde Compte',
  'Crédit Compte'
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  solde FLOAT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  pseudo TEXT,
  email TEXT,
  hashed_pass TEXT,
  salt TEXT,
  date_of_birth TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_logged TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE tags (
  user_id INT,
  tag_id TEXT,
  PRIMARY KEY (user_id, tag_id)
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  parent_role INT DEFAULT NULL,
  next_role INT DEFAULT NULL
);

CREATE TABLE roles_to_users (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  permission TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE permissions_to_roles (
  role_id INT,
  perm_id INT,
  PRIMARY KEY (role_id, perm_id)
);

CREATE TABLE permissions_to_users (
  user_id INT,
  perm_id INT,
  PRIMARY KEY (user_id, perm_id)
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  stock INT,
  description TEXT,
  threshold INT NOT NULL DEFAULT 0,
  fixed_threshold BOOLEAN NOT NULL DEFAULT false,
  hidden BOOLEAN NOT NULL DEFAULT false,
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE dishes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  hidden BOOLEAN NOT NULL DEFAULT false,
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE ingredients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stock FLOAT
);

CREATE TABLE ingredients_to_dishes (
  ingredient_id INT,
  dish_id INT,
  quantity FLOAT,
  count_in_stock BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (ingredient_id, dish_id)
);

CREATE TABLE dishes_options (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL,
  name TEXT NOT NULL,
  price_change FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE products_ranked_prices (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  rank INT NOT NULL,
  price FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products_menu_prices (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  price FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products_cost_prices (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  price FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dishes_ranked_prices (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL,
  rank INT NOT NULL,
  price FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dishes_cost_prices (
  id SERIAL PRIMARY KEY,
  dish_id INT NOT NULL,
  price FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredients_cost_prices (
  id SERIAL PRIMARY KEY,
  ingredient_id INT NOT NULL,
  price FLOAT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings_products_prices (
  product_id INT PRIMARY KEY,
  rank INT,
  mutliplier FLOAT,
  add FLOAT
);

CREATE TABLE settings_dishes_prices (
  dish_id INT PRIMARY KEY,
  rank INT NOT NULL,
  mutliplier FLOAT,
  add FLOAT
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  hidden BOOLEAN NOT NULL DEFAULT false,
  index INT NOT NULL
);

CREATE TABLE products_to_categories (
  product_id INT,
  category_id INT,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE favorites (
  user_id INT,
  product_id INT,
  index INT,
  PRIMARY KEY (user_id, index),
  UNIQUE (user_id, product_id)
);

CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE products_inside_menus (
  menu_id INT PRIMARY KEY,
  index INT NOT NULL,
  product_id INT NOT NULL,
  forced BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE dishes_inside_menus (
  menu_id INT PRIMARY KEY,
  index INT NOT NULL,
  dish_id INT NOT NULL,
  forced BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE categories_inside_menus (
  menu_id INT PRIMARY KEY,
  index INT NOT NULL,
  category_id INT NOT NULL,
  forced BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  manager_id INT,
  status ORDER_STATUS NOT NULL,
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  for_date TIMESTAMPTZ DEFAULT NULL,
  last_change TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products_inside_orders (
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  taken INT NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE menus_inside_orders (
  id SERIAL PRIMARY KEY,
  order_id INT,
  menu_id INT,
  taken BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE products_inside_menus_orders (
  menu_order_id INT,
  index INT NOT NULL,
  product_id INT,
  quantity INT NOT NULL,
  taken INT NOT NULL,
  PRIMARY KEY (menu_order_id, product_id)
);

CREATE TABLE dishes_inside_menus_orders (
  menu_order_id INT,
  index INT NOT NULL,
  dish_id INT,
  quantity INT NOT NULL,
  taken INT NOT NULL,
  PRIMARY KEY (menu_order_id, dish_id)
);

CREATE TABLE dishes_options_inside_menus_orders (
  menu_order_id INT,
  dish_id INT,
  dish_option_id INT,
  PRIMARY KEY (menu_order_id, dish_id, dish_option_id)
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  description TEXT,
  start_ordering TIMESTAMPTZ,
  end_ordering TIMESTAMPTZ,
  start_service TIMESTAMPTZ,
  end_service TIMESTAMPTZ,
  amount INT,
  taken INT NOT NULL,
  max_per_user INT DEFAULT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE menus_inside_services (
  service_id INT,
  menu_id INT,
  max_per_user INT DEFAULT NULL,
  amount INT,
  taken INT NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (service_id, menu_id)
);

CREATE TABLE users_inside_services (
  service_id INT,
  user_id INT,
  points INT DEFAULT 0,
  status PLANNING_STATUS NOT NULL,
  PRIMARY KEY (service_id, user_id)
);

CREATE TABLE inventories (
  id SERIAL PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  manager_id INT
);

CREATE TABLE products_inside_inventory (
  id SERIAL PRIMARY KEY,
  inventory_id INT NOT NULL,
  product_id INT NOT NULL,
  nbr INT NOT NULL DEFAULT 0,
  pure BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE ingredients_inside_inventory (
  id SERIAL PRIMARY KEY,
  inventory_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  nbr INT NOT NULL DEFAULT 0,
  pure BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE restocking (
  id SERIAL PRIMARY KEY,
  place_id INT,
  manager_id INT,
  driver_id INT,
  diverse_cost FLOAT DEFAULT 0,
  date TIMESTAMPTZ NOT NULL default CURRENT_TIMESTAMP
);

CREATE TABLE restocking_places (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  distance FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE products_inside_restocking (
  id SERIAL PRIMARY KEY,
  restocking_id INT NOT NULL,
  product_id INT NOT NULL,
  TVA FLOAT DEFAULT NULL,
  nbr_stack INT NOT NULL DEFAULT 1,
  nbr_in_stack INT NOT NULL DEFAULT 1
);

CREATE TABLE ingredients_inside_restocking (
  id SERIAL PRIMARY KEY,
  restocking_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  TVA FLOAT DEFAULT NULL,
  nbr_stack INT NOT NULL DEFAULT 1,
  nbr_in_stack INT NOT NULL DEFAULT 1
);

CREATE TABLE funds_stats (
  id SERIAL PRIMARY KEY,
  CA FLOAT NOT NULL,
  benefits FLOAT NOT NULL,
  losses FLOAT NOT NULL,
  stocks_value FLOAT NOT NULL,
  points_given INT NOT NULL,
  date TIMESTAMPTZ NOT NULL default CURRENT_TIMESTAMP
);

CREATE TABLE cash_funds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  fund FLOAT NOT NULL,
  exterior BOOLEAN NOT NULL DEFAULT false,
  by_default BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE cash_funds_operations (
  id SERIAL PRIMARY KEY,
  manager_id INT,
  source_cash_fund_id INT,
  destination_cash_fund_id INT NOT NULL,
  type CASH_FUNDS_OPERATIONS_TYPE NOT NULL,
  description TEXT,
  means TRANSACTION_MEANS NOT NULL,
  amount FLOAT NOT NULL,
  date TIMESTAMPTZ default CURRENT_TIMESTAMP
);

CREATE TABLE connections_history (
  id SERIAL PRIMARY KEY,
  user_id INT,
  tag TEXT,
  date TIMESTAMPTZ default CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT,
  manager_id INT,
  name TEXT NOT NULL,
  description TEXT,
  type TRANSACTION_TYPE NOT NULL,
  means TRANSACTION_MEANS NOT NULL,
  money FLOAT NOT NULL,
  points INT NOT NULL,
  previous_money FLOAT NOT NULL,
  previous_points INT NOT NULL,
  date TIMESTAMPTZ NOT NULL default CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  name TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT
);

CREATE TABLE expiring (
  id SERIAL PRIMARY KEY,
  manager_id INT,
  diverse_cost FLOAT DEFAULT 0,
  date TIMESTAMPTZ NOT NULL default CURRENT_TIMESTAMP
);

CREATE TABLE products_inside_expiring (
  id SERIAL PRIMARY KEY,
  expiring_id INT NOT NULL,
  product_id INT NOT NULL,
  nbr INT NOT NULL DEFAULT 1
);

CREATE TABLE ingredients_inside_expiring (
  id SERIAL PRIMARY KEY,
  expiring_id INT NOT NULL,
  ingredient_id INT NOT NULL,
  nbr INT NOT NULL DEFAULT 1
);

ALTER TABLE tags ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE roles ADD FOREIGN KEY (parent_role) REFERENCES roles (id)  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE roles ADD FOREIGN KEY (next_role) REFERENCES roles (id)  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE roles_to_users ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE roles_to_users ADD FOREIGN KEY (role_id) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE permissions_to_roles ADD FOREIGN KEY (role_id) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE permissions_to_roles ADD FOREIGN KEY (perm_id) REFERENCES permissions (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE permissions_to_users ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE permissions_to_users ADD FOREIGN KEY (perm_id) REFERENCES permissions (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_to_dishes ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_to_dishes ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_options ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_ranked_prices ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_ranked_prices ADD FOREIGN KEY (rank) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_menu_prices ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_cost_prices ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_ranked_prices ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_ranked_prices ADD FOREIGN KEY (rank) REFERENCES roles (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_cost_prices ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_cost_prices ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE settings_products_prices ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE settings_dishes_prices ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_to_categories ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_to_categories ADD FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE favorites ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE favorites ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_menus ADD FOREIGN KEY (menu_id) REFERENCES menus (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_menus ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_inside_menus ADD FOREIGN KEY (menu_id) REFERENCES menus (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_inside_menus ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE categories_inside_menus ADD FOREIGN KEY (menu_id) REFERENCES menus (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE categories_inside_menus ADD FOREIGN KEY (category_id) REFERENCES categories (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE orders ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE orders ADD FOREIGN KEY (manager_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE products_inside_orders ADD FOREIGN KEY (order_id) REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_orders ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE menus_inside_orders ADD FOREIGN KEY (order_id) REFERENCES orders (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE menus_inside_orders ADD FOREIGN KEY (menu_id) REFERENCES menus (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_menus_orders ADD FOREIGN KEY (menu_order_id) REFERENCES menus_inside_orders (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_menus_orders ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_inside_menus_orders ADD FOREIGN KEY (menu_order_id) REFERENCES menus_inside_orders (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_inside_menus_orders ADD FOREIGN KEY (dish_id) REFERENCES dishes (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE menus_inside_services ADD FOREIGN KEY (service_id) REFERENCES services (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE menus_inside_services ADD FOREIGN KEY (menu_id) REFERENCES menus (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE users_inside_services ADD FOREIGN KEY (service_id) REFERENCES services (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE users_inside_services ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE inventories ADD FOREIGN KEY (manager_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE products_inside_inventory ADD FOREIGN KEY (inventory_id) REFERENCES inventories (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_inventory ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_inside_inventory ADD FOREIGN KEY (inventory_id) REFERENCES inventories (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_inside_inventory ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE restocking ADD FOREIGN KEY (place_id) REFERENCES restocking_places (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE restocking ADD FOREIGN KEY (manager_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE restocking ADD FOREIGN KEY (driver_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE products_inside_restocking ADD FOREIGN KEY (restocking_id) REFERENCES restocking (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_restocking ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_inside_restocking ADD FOREIGN KEY (restocking_id) REFERENCES restocking (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_inside_restocking ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE cash_funds_operations ADD FOREIGN KEY (manager_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE cash_funds_operations ADD FOREIGN KEY (source_cash_fund_id) REFERENCES cash_funds (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE cash_funds_operations ADD FOREIGN KEY (destination_cash_fund_id) REFERENCES cash_funds (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE connections_history ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE transactions ADD FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE transactions ADD FOREIGN KEY (manager_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE expiring ADD FOREIGN KEY (manager_id) REFERENCES users (id)  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE products_inside_expiring ADD FOREIGN KEY (expiring_id) REFERENCES expiring (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE products_inside_expiring ADD FOREIGN KEY (product_id) REFERENCES products (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_inside_expiring ADD FOREIGN KEY (expiring_id) REFERENCES expiring (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ingredients_inside_expiring ADD FOREIGN KEY (ingredient_id) REFERENCES ingredients (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE dishes_options_inside_menus_orders ADD FOREIGN KEY (menu_order_id) REFERENCES menus_inside_orders (id);

ALTER TABLE dishes_options_inside_menus_orders ADD FOREIGN KEY (dish_id) REFERENCES dishes (id);

ALTER TABLE dishes_options_inside_menus_orders ADD FOREIGN KEY (dish_option_id) REFERENCES dishes_options (id);

COMMENT ON COLUMN permissions.permission IS 'prix coutant est une perm';

COMMENT ON COLUMN products.threshold IS 'Seuil qu''il faut avoir par semaine.';

COMMENT ON COLUMN products.fixed_threshold IS 'Seuil defini par l''utilisateur.';

COMMENT ON COLUMN ingredients_to_dishes.count_in_stock IS 'Si on enlève les produits du stock';

COMMENT ON COLUMN settings_products_prices.rank IS 'NULL pour menu';

COMMENT ON COLUMN settings_products_prices.mutliplier IS 'Multiplie cost price par...';

COMMENT ON COLUMN settings_products_prices.add IS 'ajoute ... au cost price';

COMMENT ON COLUMN settings_dishes_prices.mutliplier IS 'Multiplie cost price par...';

COMMENT ON COLUMN settings_dishes_prices.add IS 'ajoute ... au cost price';

COMMENT ON COLUMN favorites.index IS 'user_id et index ensembles devraient être uniques';

COMMENT ON COLUMN products_inside_menus.index IS 'Pour l''ordre';

COMMENT ON COLUMN dishes_inside_menus.index IS 'Pour l''ordre';

COMMENT ON COLUMN categories_inside_menus.index IS 'Pour l''ordre';

COMMENT ON COLUMN orders.status IS 'En Attente, Validé, Remboursé';

COMMENT ON COLUMN products_inside_menus_orders.index IS 'Pour l''ordre';

COMMENT ON COLUMN dishes_inside_menus_orders.index IS 'Pour l''ordre';

COMMENT ON COLUMN services.amount IS 'Si NULL, se limiter à la quantité de menus à l''intérieur des services';

COMMENT ON COLUMN menus_inside_services.amount IS 'Si NULL, se limiter à la quantité de menus du service';

COMMENT ON COLUMN users_inside_services.points IS 'Points rémunérés aux participants pour le service';

COMMENT ON COLUMN users_inside_services.status IS 'En Attente, Validé, Absent sans excuse, Absent avec excuse';

COMMENT ON COLUMN restocking.diverse_cost IS 'Coûts divers ne rentrant pas dans les produits.';

COMMENT ON COLUMN products_inside_restocking.TVA IS 'NULL = pas de TVA renseignée';

COMMENT ON COLUMN ingredients_inside_restocking.TVA IS 'NULL = pas de TVA renseignée';

COMMENT ON COLUMN cash_funds.exterior IS 'L''argent est extérieur au bar';

COMMENT ON COLUMN cash_funds_operations.type IS 'Exceptionnelle, Ordinaire';

COMMENT ON COLUMN connections_history.user_id IS 'null si inconnu';

COMMENT ON COLUMN transactions.means IS 'Carte Bleue, Chèque, Liquide, Points, Lydia';

COMMENT ON COLUMN expiring.diverse_cost IS 'Coûts divers ne rentrant pas dans les produits.';