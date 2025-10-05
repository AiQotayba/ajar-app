CREATE TABLE `Users`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `first_name` VARCHAR(255) NOT NULL DEFAULT 'DEFAULT NULL',
    `last_name` VARCHAR(255) NOT NULL DEFAULT 'DEFAULT NULL',
    `phone` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NULL DEFAULT 'DEFAULT NULL',
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `status` ENUM('active', 'banned') NOT NULL DEFAULT 'active',
    `phone_verified` BOOLEAN NOT NULL,
    `otp` VARCHAR(10) NULL DEFAULT 'DEFAULT NULL',
    `otp_expire_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `avatar` VARCHAR(255) NULL DEFAULT 'DEFAULT NULL',
    `language` VARCHAR(5) NOT NULL DEFAULT 'ar',
    `wallet_balance` DOUBLE NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `deleted_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
CREATE TABLE `Governorates`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NULL DEFAULT 'DEFAULT NULL',
    `orders` INT NULL DEFAULT 'DEFAULT NULL',
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
CREATE TABLE `Cities`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `governorate_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `place_id` VARCHAR(255) NULL DEFAULT 'DEFAULT NULL',
    `orders` INT NULL DEFAULT 'DEFAULT NULL',
    `availability` TINYINT(1) NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `Cities` ADD INDEX `cities_governorate_id_index`(`governorate_id`);
CREATE TABLE `Views`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL DEFAULT 'DEFAULT NULL',
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `Views` ADD INDEX `views_listing_id_index`(`listing_id`);
ALTER TABLE
    `Views` ADD INDEX `views_user_id_index`(`user_id`);
CREATE TABLE `Favorites`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `Favorites` ADD UNIQUE `favorites_user_id_listing_id_unique`(`user_id`, `listing_id`);
ALTER TABLE
    `Favorites` ADD INDEX `favorites_user_id_index`(`user_id`);
ALTER TABLE
    `Favorites` ADD INDEX `favorites_listing_id_index`(`listing_id`);
CREATE TABLE `Sliders`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `image_url` VARCHAR(1024) NOT NULL,
    `target_url` VARCHAR(1024) NULL DEFAULT 'DEFAULT NULL',
    `start_at` DATETIME NOT NULL,
    `end_at` DATETIME NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT '1',
    `clicks` INT NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `Sliders` ADD INDEX `sliders_active_start_at_end_at_index`(`active`, `start_at`, `end_at`);
CREATE TABLE `ListingReviews`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment` TEXT NULL,
    `is_approved` TINYINT(1) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `deleted_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `ListingReviews` ADD INDEX `listingreviews_listing_id_index`(`listing_id`);
ALTER TABLE
    `ListingReviews` ADD INDEX `listingreviews_user_id_index`(`user_id`);
CREATE TABLE `Settings`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT NULL DEFAULT 'DEFAULT NULL',
    `type` ENUM(
        'int',
        'float',
        'text',
        'long_text',
        'json',
        'bool',
        'datetime',
        'html'
    ) NOT NULL DEFAULT 'text',
    `is_settings` TINYINT(1) NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `Settings` ADD UNIQUE `settings_key_unique`(`key`);
CREATE TABLE `Notifications`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NULL DEFAULT 'DEFAULT NULL',
    `title` TEXT NOT NULL,
    `message` LONGTEXT NOT NULL,
    `notificationable_id` BIGINT UNSIGNED NULL DEFAULT 'DEFAULT NULL',
    `notificationable_type` VARCHAR(255) NULL DEFAULT 'DEFAULT NULL',
    `read_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `metadata` JSON NULL DEFAULT 'DEFAULT NULL',
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `Notifications` ADD INDEX `notifications_user_id_index`(`user_id`);
CREATE TABLE `PersonalAccessTokens`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `tokenable_type` VARCHAR(255) NOT NULL,
    `tokenable_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `abilities` TEXT NULL DEFAULT 'DEFAULT NULL',
    `device_type` VARCHAR(255) NULL DEFAULT 'DEFAULT NULL',
    `device_token` VARCHAR(255) NULL DEFAULT 'DEFAULT NULL',
    `last_used_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `expires_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `created_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL',
    `updated_at` TIMESTAMP NULL DEFAULT 'DEFAULT NULL'
);
ALTER TABLE
    `PersonalAccessTokens` ADD INDEX `personalaccesstokens_tokenable_type_tokenable_id_index`(`tokenable_type`, `tokenable_id`);
ALTER TABLE
    `PersonalAccessTokens` ADD UNIQUE `personalaccesstokens_token_unique`(`token`);
CREATE TABLE `Listings`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `owner_id` BIGINT UNSIGNED NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `title` TEXT NOT NULL,
    `ribon_text` VARCHAR(255) NULL,
    `ribon_color` VARCHAR(20) NOT NULL,
    `description` LONGTEXT NULL,
    `price` DOUBLE NOT NULL,
    `currency` VARCHAR(255) NOT NULL,
    `governorate_id` BIGINT UNSIGNED NOT NULL,
    `city_id` BIGINT UNSIGNED NULL,
    `latitude` VARCHAR(255) NULL,
    `longitude` VARCHAR(255) NULL,
    `status` ENUM(
        'draft',
        'in_review',
        'approved',
        'rejected'
    ) NOT NULL,
    `availability_status` ENUM(
        'available',
        'unavailable',
        'rented',
        'solded'
    ) NOT NULL,
    `available_from` DATETIME NULL,
    `available_until` DATETIME NULL,
    `type` ENUM('rent', 'sale') NOT NULL,
    `pay_every` INT NULL,
    `insurance` DOUBLE NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT '0',
    `views_count` BIGINT NOT NULL,
    `favorites_count` BIGINT NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
CREATE TABLE `Categories`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` TEXT NOT NULL,
    `icon` VARCHAR(255) NOT NULL,
    `properties_source` ENUM(
        'custom',
        'parent',
        'parent_and_custom'
    ) NOT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `is_visible` BOOLEAN NOT NULL DEFAULT '1',
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
CREATE TABLE `Media`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('image', 'video') NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `source` ENUM('file', 'link') NOT NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `imageable_id` BIGINT UNSIGNED NOT NULL,
    `imageable_type` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
CREATE TABLE `Properties`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(255) NOT NULL,
    `type` ENUM(
        'int',
        'float',
        'bool',
        'datetime',
        'enum'
    ) NOT NULL,
    `options` JSON NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
CREATE TABLE `ListingProperties`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `propertie_id` BIGINT UNSIGNED NOT NULL,
    `value` LONGTEXT NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
CREATE TABLE `Features`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(255) NOT NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
CREATE TABLE `ListingFeatures`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `listing_id` BIGINT UNSIGNED NOT NULL,
    `feature_id` BIGINT UNSIGNED NOT NULL,
    `sort_order` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP NULL,
    `updated_at` TIMESTAMP NULL
);
ALTER TABLE
    `Listings` ADD CONSTRAINT `listings_governorate_id_foreign` FOREIGN KEY(`governorate_id`) REFERENCES `Governorates`(`id`);
ALTER TABLE
    `Views` ADD CONSTRAINT `views_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `Properties` ADD CONSTRAINT `properties_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `Categories`(`id`);
ALTER TABLE
    `Views` ADD CONSTRAINT `views_listing_id_foreign` FOREIGN KEY(`listing_id`) REFERENCES `Listings`(`id`);
ALTER TABLE
    `ListingProperties` ADD CONSTRAINT `listingproperties_listing_id_foreign` FOREIGN KEY(`listing_id`) REFERENCES `Listings`(`id`);
ALTER TABLE
    `ListingProperties` ADD CONSTRAINT `listingproperties_propertie_id_foreign` FOREIGN KEY(`propertie_id`) REFERENCES `Properties`(`id`);
ALTER TABLE
    `Favorites` ADD CONSTRAINT `favorites_listing_id_foreign` FOREIGN KEY(`listing_id`) REFERENCES `Listings`(`owner_id`);
ALTER TABLE
    `Listings` ADD CONSTRAINT `listings_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `Categories`(`id`);
ALTER TABLE
    `Sliders` ADD CONSTRAINT `sliders_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `Favorites` ADD CONSTRAINT `favorites_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `Cities` ADD CONSTRAINT `cities_governorate_id_foreign` FOREIGN KEY(`governorate_id`) REFERENCES `Governorates`(`id`);
ALTER TABLE
    `ListingReviews` ADD CONSTRAINT `listingreviews_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `ListingReviews` ADD CONSTRAINT `listingreviews_listing_id_foreign` FOREIGN KEY(`listing_id`) REFERENCES `Listings`(`id`);
ALTER TABLE
    `ListingFeatures` ADD CONSTRAINT `listingfeatures_feature_id_foreign` FOREIGN KEY(`feature_id`) REFERENCES `Features`(`id`);
ALTER TABLE
    `Categories` ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY(`parent_id`) REFERENCES `Categories`(`id`);
ALTER TABLE
    `Features` ADD CONSTRAINT `features_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `Categories`(`id`);
ALTER TABLE
    `Listings` ADD CONSTRAINT `listings_city_id_foreign` FOREIGN KEY(`city_id`) REFERENCES `Cities`(`id`);
ALTER TABLE
    `Notifications` ADD CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Users`(`id`);
ALTER TABLE
    `ListingFeatures` ADD CONSTRAINT `listingfeatures_listing_id_foreign` FOREIGN KEY(`listing_id`) REFERENCES `Listings`(`id`);