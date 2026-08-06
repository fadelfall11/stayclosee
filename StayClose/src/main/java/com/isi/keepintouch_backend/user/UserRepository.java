package com.isi.keepintouch_backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA génère automatiquement la requête SQL
    // à partir du nom de la méthode - aucune implémentation à écrire !
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}