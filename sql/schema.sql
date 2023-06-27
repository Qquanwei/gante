CREATE OR REPLACE FUNCTION generate_uid(size INT) RETURNS TEXT AS $$
DECLARE
  characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  bytes BYTEA := gen_random_bytes(size);
  l INT := length(characters);
  i INT := 0;
  output TEXT := '';
BEGIN
  WHILE i < size LOOP
    output := output || substr(characters, get_byte(bytes, i) % l + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN output;
END;
$$ LANGUAGE plpgsql VOLATILE;


CREATE TABLE IF NOT EXISTS ops (
  collection character varying(255) not null,
  doc_id character varying(255) not null,
  version integer not null,
  operation jsonb not null
);

CREATE TABLE IF NOT EXISTS snapshots (
  collection character varying(255) not null,
  doc_id character varying(255) not null,
  doc_type character varying(255) not null,
  version integer not null,
  data jsonb not null,
  PRIMARY KEY (collection, doc_id)
);

CREATE INDEX IF NOT EXISTS idx_ops_collection_doc_id ON ops(collection, doc_id);
CREATE INDEX IF NOT EXISTS snapshots_version ON snapshots (collection, doc_id);

ALTER TABLE ops
  ALTER COLUMN operation
  SET DATA TYPE jsonb
  USING operation::jsonb;

ALTER TABLE snapshots
  ALTER COLUMN data
  SET DATA TYPE jsonb
  USING data::jsonb;


CREATE TABLE IF NOT EXISTS users (
  _id character varying(50) PRIMARY KEY DEFAULT generate_uid(50),
  userName character varying(255),
  avatar TEXT,
  createDate int,
  phone character varying(20),
  githubUserId character varying(255),
  password character varying(255),
  defaultTableId character varying(255) not null,
  extra jsonb not null default '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS sessions (
  uid character varying(50) references users(_id),
  token character varying(1024) PRIMARY KEY,
  expire TEXT
);

CREATE TABLE IF NOT EXISTS captcha (
  phone character varying(20),
  number character varying(20),
  sendTime TEXT
);

CREATE INDEX IF NOT EXISTS idx_captcha_phone ON captcha(phone);

CREATE TABLE IF NOT EXISTS mem (
   listId character varying(255) not null,
   clients jsonb not null default '[]'::jsonb,
   cnt int default 0,
   loginDate date,
   PRIMARY KEY (listId)
);

CREATE TABLE IF NOT EXiSTS suggests(
 content text,
 sender text,
 uid character varying(50) references users(_id)
);
