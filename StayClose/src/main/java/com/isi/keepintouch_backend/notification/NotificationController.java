package com.isi.keepintouch_backend.notification;

import com.isi.keepintouch_backend.security.CurrentUserProvider;
import com.isi.keepintouch_backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public List<NotificationResponse> getMesNotifications() {
        User utilisateur = currentUserProvider.getCurrentUser();
        return notificationRepository.findByUtilisateurOrderByDateCreationDesc(utilisateur)
                .stream()
                .map(NotificationResponse::fromEntity)
                .toList();
    }

    @PostMapping("/generer")
    public Map<String, Object> genererMaintenant() {
        int nbCreees = notificationService.declencherManuellement();
        return Map.of("nouvellesNotifications", nbCreees);
    }
}