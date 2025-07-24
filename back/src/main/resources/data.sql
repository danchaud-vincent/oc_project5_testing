-- Insérer enseignants s'ils n'existent pas
INSERT INTO TEACHERS (first_name, last_name)
SELECT 'Margot', 'DELAHAYE'
WHERE NOT EXISTS (
  SELECT 1 FROM TEACHERS WHERE first_name = 'Margot' AND last_name = 'DELAHAYE'
);

INSERT INTO TEACHERS (first_name, last_name)
SELECT 'Hélène', 'THIERCELIN'
WHERE NOT EXISTS (
  SELECT 1 FROM TEACHERS WHERE first_name = 'Hélène' AND last_name = 'THIERCELIN'
);

-- Insérer admin s'il n'existe pas
INSERT INTO USERS (first_name, last_name, admin, email, password)
SELECT 'Admin', 'Admin', true, 'yoga@studio.com', '$2a$10$.Hsa/ZjUVaHqi0tp9xieMeewrnZxrZ5pQRzddUXE/WjDu2ZThe6Iq'
WHERE NOT EXISTS (
  SELECT 1 FROM USERS WHERE email = 'yoga@studio.com'
);

