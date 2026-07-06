package com.ieee.ite.service;

import com.ieee.ite.document.UserDocument;
import com.ieee.ite.document.UserDocumentRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserDocumentRepository userDocumentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDetailsServiceImpl(UserDocumentRepository userDocumentRepository, PasswordEncoder passwordEncoder) {
        this.userDocumentRepository = userDocumentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (userDocumentRepository.existsByTeamName(username)) {
            throw new UsernameNotFoundException("Team name not found");
        }
        UserDocument userDocument = userDocumentRepository.findById(username);
        return User.builder().username(username).password(passwordEncoder.encode(userDocument.getPassword())).roles(userDocument.getRole().toString()).build();
    }
}
