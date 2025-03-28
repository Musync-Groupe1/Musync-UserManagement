CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(250),
    last_name VARCHAR(250),
    email VARCHAR(2100),
    birthdate DATE,
    gender ENUM('Male', 'Female', 'Other')
);

CREATE TABLE Profile (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    profile_picture INT,
    pictures INT,
    is_private BOOLEAN,
    is_certified BOOLEAN,
    description TEXT,
    accepted_age_gap INT,
    accepted_distance INT,
    targeted_gender VARCHAR(250),
    favorite_musician VARCHAR(255),
    favorite_music VARCHAR(255),
    favorite_musical_style VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (profile_picture) REFERENCES Picture(picture_id),
    FOREIGN KEY (pictures) REFERENCES Picture(picture_id)
);

CREATE TABLE Picture (
    picture_id INT PRIMARY KEY AUTO_INCREMENT,
    link VARCHAR(255),
    name VARCHAR(255),
    posted_date DATE
);

CREATE TABLE SocialMedia (
    social_media_id INT PRIMARY KEY AUTO_INCREMENT,
    social_media_name VARCHAR(250)
);

CREATE TABLE UserSocialMedia (
    user_id INT,
    social_media_id INT,
    token_account VARCHAR(255),
    is_private BOOLEAN,
    PRIMARY KEY (user_id, social_media_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (social_media_id) REFERENCES SocialMedia(social_media_id)
);
