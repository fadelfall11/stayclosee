package com.isi.keepintouch_backend.security;

import com.isi.keepintouch_backend.user.User;
import com.isi.keepintouch_backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = extractEmail(authentication);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "Aucun utilisateur trouvé pour l'email " + email +
                                " - inscris-toi d'abord via /api/auth/register avec ce même email"));
    }

    private String extractEmail(Authentication authentication) {
        // Cas 1 : authentification via notre JWT classique (email = "name" du token)
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            // Cas 2 : authentification via session Google OAuth2
            return oauthToken.getPrincipal().getAttribute("email");
        }
        return authentication.getName();
    }
}