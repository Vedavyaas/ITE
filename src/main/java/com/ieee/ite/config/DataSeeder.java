package com.ieee.ite.config;

import com.ieee.ite.assets.Role;
import com.ieee.ite.document.UserDocument;
import com.ieee.ite.document.UserDocumentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;
    private final UserDocumentRepository userDocumentRepository;

    public DataSeeder(PasswordEncoder passwordEncoder, UserDocumentRepository userDocumentRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userDocumentRepository = userDocumentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userDocumentRepository.count() == 0) {
            UserDocument userDocument = new UserDocument("admin", "admin", passwordEncoder.encode("myPass"), Role.ADMIN, null);
            userDocumentRepository.save(userDocument);
        }
    }
}
