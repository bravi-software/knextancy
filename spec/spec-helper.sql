-- script that truncate all tables from a database

SELECT 'SET FOREIGN_KEY_CHECKS = 0;' trucate_table_cmd
UNION
SELECT Concat('TRUNCATE TABLE `' ,table_schema, '`.`', TABLE_NAME, '`;') trucate_table_cmd
  FROM INFORMATION_SCHEMA.TABLES
  WHERE table_schema = (SELECT database())
    AND TABLE_NAME NOT LIKE '%knex_migrations'
UNION
SELECT 'SET FOREIGN_KEY_CHECKS = 1;' trucate_table_cmd
