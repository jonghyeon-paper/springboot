DROP TABLE USERS IF EXISTS;

CREATE TABLE USERS (
    USERNAME VARCHAR_IGNORECASE(50) NOT NULL PRIMARY KEY,
    PASSWORD VARCHAR_IGNORECASE(50) NOT NULL,
    ENABLED BOOLEAN NOT NULL
);

DROP TABLE ARTICLES IF EXISTS;

CREATE TABLE ARTICLES (
    ARTICLE_KEY BIGINT GENERATED BY DEFAULT AS IDENTITY(START WITH 100) PRIMARY KEY,
    TITLE VARCHAR(300) NOT NULL,
    CONTENT CLOB,
    USERNAME VARCHAR_IGNORECASE(50) NOT NULL,
    CREATE_DATE TIMESTAMP NOT NULL,
    MODIFY_DATE TIMESTAMP NOT NULL,
);