-- DropForeignKey
ALTER TABLE `boxes` DROP FOREIGN KEY `boxes_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `cards` DROP FOREIGN KEY `cards_box_id_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_card_id_fkey`;

-- DropForeignKey
ALTER TABLE `settings` DROP FOREIGN KEY `settings_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `boxes` ADD CONSTRAINT `boxes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cards` ADD CONSTRAINT `cards_box_id_fkey` FOREIGN KEY (`box_id`) REFERENCES `boxes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
