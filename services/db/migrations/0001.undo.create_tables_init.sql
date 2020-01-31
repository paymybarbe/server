DROP TABLE users CASCADE;

DROP TABLE tags CASCADE;

DROP TABLE roles CASCADE;

DROP TABLE roles_to_users CASCADE;

DROP TABLE permissions CASCADE;

DROP TABLE permissions_to_roles CASCADE;

DROP TABLE permissions_to_users CASCADE;

DROP TABLE products CASCADE;

DROP TABLE dishes CASCADE;

DROP TABLE ingredients CASCADE;

DROP TABLE ingredients_to_dishes CASCADE;

DROP TABLE dishes_options CASCADE;

DROP TABLE products_ranked_prices CASCADE;

DROP TABLE products_menu_prices CASCADE;

DROP TABLE products_cost_prices CASCADE;

DROP TABLE dishes_ranked_prices CASCADE;

DROP TABLE dishes_cost_prices CASCADE;

DROP TABLE ingredients_cost_prices CASCADE;

DROP TABLE settings_products_prices CASCADE;

DROP TABLE settings_dishes_prices CASCADE;

DROP TABLE categories CASCADE;

DROP TABLE products_to_categories CASCADE;

DROP TABLE favorites CASCADE;

DROP TABLE menus CASCADE;

DROP TABLE products_inside_menus CASCADE;

DROP TABLE dishes_inside_menus CASCADE;

DROP TABLE categories_inside_menus CASCADE;

DROP TABLE orders CASCADE;

DROP TABLE products_inside_orders CASCADE;

DROP TABLE menus_inside_orders CASCADE;

DROP TABLE products_inside_menus_orders CASCADE;

DROP TABLE dishes_inside_menus_orders CASCADE;

DROP TABLE services CASCADE;

DROP TABLE menus_inside_services CASCADE;

DROP TABLE users_inside_services CASCADE;

DROP TABLE inventories CASCADE;

DROP TABLE inside_inventory CASCADE;

DROP TABLE restocking CASCADE;

DROP TABLE restocking_places CASCADE;

DROP TABLE products_inside_restocking CASCADE;

DROP TABLE ingredients_inside_restocking CASCADE;

DROP TABLE funds_stats CASCADE;

DROP TABLE cash_funds CASCADE;

DROP TABLE cash_funds_operations CASCADE;

DROP TABLE connections_history CASCADE;

DROP TABLE transactions CASCADE;

DROP TABLE settings CASCADE;

DROP TABLE expiring CASCADE;

DROP TABLE products_inside_expiring CASCADE;

DROP TABLE ingredients_inside_expiring CASCADE;

DROP TABLE dishes_options_inside_menus_orders CASCADE;

DROP TYPE ORDER_STATUS CASCADE;

DROP TYPE PLANNING_STATUS CASCADE;

DROP TYPE CASH_FUNDS_OPERATIONS_TYPE CASCADE;

DROP TYPE TRANSACTION_MEANS CASCADE;

DROP TYPE TRANSACTION_TYPE CASCADE;