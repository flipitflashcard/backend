-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `auth_token` VARCHAR(64) NULL,
    `created_at` BIGINT UNSIGNED NOT NULL,
    `updated_at` BIGINT UNSIGNED NULL,
    `deleted_at` BIGINT UNSIGNED NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `boxes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `language_code` VARCHAR(5) NOT NULL,
    `created_at` BIGINT UNSIGNED NOT NULL,
    `updated_at` BIGINT UNSIGNED NULL,
    `deleted_at` BIGINT UNSIGNED NULL,

    INDEX `boxes_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cards` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `box_id` BIGINT UNSIGNED NOT NULL,
    `front` VARCHAR(300) NOT NULL,
    `back` JSON NOT NULL,
    `type` ENUM('NOUN', 'ADJ', 'ADV', 'VERB') NOT NULL,
    `voice_url` VARCHAR(3000) NULL,
    `is_favorite` BOOLEAN NOT NULL DEFAULT false,
    `srs_interval` INTEGER NOT NULL,
    `ease_factor` DECIMAL(65, 30) NOT NULL,
    `due_date` BIGINT UNSIGNED NOT NULL,
    `created_at` BIGINT UNSIGNED NOT NULL,
    `updated_at` BIGINT UNSIGNED NULL,
    `deleted_at` BIGINT UNSIGNED NULL,

    INDEX `cards_due_date_idx`(`due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `card_id` BIGINT UNSIGNED NOT NULL,
    `rating` ENUM('KNOW', 'FORGET') NOT NULL,
    `duration` INTEGER NOT NULL,
    `reviewed_at` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` TINYINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` VARCHAR(1000) NOT NULL,
    `created_at` BIGINT UNSIGNED NOT NULL,
    `updated_at` BIGINT UNSIGNED NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `email` VARCHAR(100) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `created_at` BIGINT UNSIGNED NOT NULL,

    UNIQUE INDEX `password_resets_email_key`(`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_box_id_fkey` FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
