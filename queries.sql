CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(15) UNIQUE NOT NULL,
  color VARCHAR(15)
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  item VARCHAR(100) NOT NULL
  user_id INTEGER REFERENCES users(id)
);

INSERT INTO users (name, color)
VALUES ('David', 'teal'), ('Daniel', 'powderblue');


INSERT INTO items (item,user_id) 
VALUES ('Buy milk',1), ('Finish homework',2);