package com.medicine.medicine_waste_backend.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.medicine.medicine_waste_backend.entity.Medicine;
import com.medicine.medicine_waste_backend.entity.Notification;
import com.medicine.medicine_waste_backend.repository.MedicineRepository;
import com.medicine.medicine_waste_backend.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository repository;
    private final MedicineRepository medicineRepository;

    public NotificationService(
            NotificationRepository repository,
            MedicineRepository medicineRepository) {

        this.repository = repository;
        this.medicineRepository = medicineRepository;
    }

    public List<Notification> getAllNotifications() {
        return repository.findAll();
    }

    public Notification addNotification(
            Notification notification) {

        return repository.save(notification);
    }

    public void markAsRead(Long id) {

        Notification notification =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        repository.save(notification);
    }

    /*
     * Automatic notification generation.
     *
     * This method runs automatically every 1 hour.
     */
    @Scheduled(fixedRate = 3600000)
    public void scheduledNotificationGeneration() {

        System.out.println(
                "🔔 Checking medicine notifications..."
        );

        generateNotifications();

        System.out.println(
                "✅ Notification check completed."
        );
    }

    /*
     * Generate notifications for all medicines.
     */
    public void generateNotifications() {

        List<Medicine> medicines =
                medicineRepository.findAll();

        LocalDate today =
                LocalDate.now();

        for (Medicine medicine : medicines) {

            if (medicine.getExpiryDate() == null) {
                continue;
            }

            long daysRemaining =
                    ChronoUnit.DAYS.between(
                            today,
                            medicine.getExpiryDate()
                    );

            String type = null;
            String message = null;

            /*
             * EXPIRED
             */
            if (daysRemaining < 0) {

                type = "EXPIRED";

                message =
                        medicine.getName()
                        + " batch "
                        + medicine.getBatchNumber()
                        + " has expired.";
            }

            /*
             * URGENT
             */
            else if (daysRemaining <= 30) {

                type = "URGENT";

                message =
                        medicine.getName()
                        + " batch "
                        + medicine.getBatchNumber()
                        + " expires in "
                        + daysRemaining
                        + " days.";
            }

            /*
             * WARNING
             */
            else if (daysRemaining <= 180) {

                type = "WARNING";

                message =
                        medicine.getName()
                        + " batch "
                        + medicine.getBatchNumber()
                        + " expires in "
                        + daysRemaining
                        + " days.";
            }

            /*
             * LOW STOCK
             */
            if (medicine.getQuantity() != null
                    && medicine.getQuantity() <= 10) {

                saveNotificationIfNotExists(
                        "LOW_STOCK",
                        medicine.getName()
                                + " has only "
                                + medicine.getQuantity()
                                + " units remaining.",
                        medicine
                );
            }

            /*
             * EXPIRY notification
             */
            if (type != null) {

                saveNotificationIfNotExists(
                        type,
                        message,
                        medicine
                );
            }
        }
    }

    /*
     * Save notification only if the same unread
     * notification does not already exist.
     */
    private void saveNotificationIfNotExists(
            String type,
            String message,
            Medicine medicine) {

        List<Notification> notifications =
                repository.findAll();

        boolean alreadyExists =
                notifications.stream().anyMatch(
                        notification ->
                                notification.getMedicineId()
                                        != null
                                && notification.getMedicineId()
                                        .equals(medicine.getId())
                                && notification.getType()
                                        .equals(type)
                                && Boolean.FALSE.equals(
                                        notification.getRead()
                                )
                );

        if (alreadyExists) {

            System.out.println(
                    "ℹ️ Notification already exists: "
                    + medicine.getName()
                    + " - "
                    + type
            );

            return;
        }

        Notification notification =
                new Notification();

        notification.setType(type);

        notification.setMessage(message);

        notification.setMedicineId(
                medicine.getId()
        );

        notification.setMedicineName(
                medicine.getName()
        );

        notification.setRead(false);

        repository.save(notification);

        System.out.println(
                "🔔 New notification created: "
                + medicine.getName()
                + " - "
                + type
        );
    }

    public void deleteNotification(Long id) {

        repository.deleteById(id);
    }
}