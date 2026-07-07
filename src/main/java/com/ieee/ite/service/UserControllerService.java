package com.ieee.ite.service;

import com.ieee.ite.assets.*;
import com.ieee.ite.document.UserDocument;
import com.ieee.ite.document.UserDocumentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserControllerService {
    private final UserDocumentRepository userDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;

    public UserControllerService(UserDocumentRepository userDocumentRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtEncoder jwtEncoder) {
        this.userDocumentRepository = userDocumentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
    }

    public String createUserTeam(TeamCredentials teamCredentials) {
        if (userDocumentRepository.existsByTeamName(teamCredentials.teamName())) {
            throw new DuplicateCredentialsException("Team name already exists!");
        }

        String[] members = teamCredentials.teamMembers();

        if (members == null || (members.length != 2 && members.length != 3)) {
            throw new DuplicateCredentialsException("Exactly 2 or 3 team members are required!");
        }

        // Check for duplicates within the submitted list
        Set<String> memberSet = new HashSet<>(Arrays.asList(members));
        if (memberSet.size() != members.length) {
            throw new DuplicateCredentialsException("Team members must be unique — duplicate names found!");
        }

        // Check that no member is already registered in any other team
        for (String member : members) {
            if (userDocumentRepository.existsByTeamMembersContaining(member)) {
                throw new DuplicateCredentialsException("Member \"" + member + "\" is already part of another team!");
            }
        }

        UserDocument userDocument = new UserDocument(
                teamCredentials.teamName(),
                teamCredentials.teamName(),
                passwordEncoder.encode(teamCredentials.password()),
                Role.USER,
                members
        );

        userDocumentRepository.save(userDocument);

        return "User created successfully!";
    }

    public String destroyUserTeam(String id) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Invalid team name!");
        }

        userDocumentRepository.deleteUserDocumentsById(id);
        return "User account deleted!";
    }

    public List<Statistics> getStats() {
        return userDocumentRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.USER)
                .map(user -> {
                    Long timeTakenMillis = null;
                    if (user.getStartTime() != null && user.getLatestRoundCompleteTime() != null) {
                        timeTakenMillis = Duration.between(user.getStartTime(), user.getLatestRoundCompleteTime()).toMillis();
                    }
                    return new Statistics(
                            user.getTeamName(),
                            user.getRoundProgression(),
                            user.getSubRoundProgression(),
                            timeTakenMillis,
                            user.getTeamMembers(),
                            user.getSacrificedMember()
                    );
                })
                .sorted(getLeaderboardComparator())
                .toList();
    }

    private Comparator<Statistics> getLeaderboardComparator() {
        return (s1, s2) -> {
            int r1 = getRoundRank(s1.roundProgression());
            int r2 = getRoundRank(s2.roundProgression());
            if (r1 != r2) {
                return Integer.compare(r2, r1);
            }

            int sr1 = getSubRoundRank(s1.subRound());
            int sr2 = getSubRoundRank(s2.subRound());
            if (sr1 != sr2) {
                return Integer.compare(sr2, sr1);
            }

            if (s1.timeTaken() == null && s2.timeTaken() == null) return 0;
            if (s1.timeTaken() == null) return 1;
            if (s2.timeTaken() == null) return -1;
            return s1.timeTaken().compareTo(s2.timeTaken());
        };
    }

    private int getRoundRank(RoundProgression round) {
        if (round == null) return 0;
        return switch (round) {
            case YET_TO_START -> 0;
            case FIRST -> 1;
            case SECOND -> 2;
            case THIRD -> 3;
            case FOURTH -> 4;
            case FIFTH -> 5;
            case SIXTH -> 6;
            case COMPLETED -> 7;
        };
    }

    private int getSubRoundRank(SubRound subRound) {
        if (subRound == null) return 0;
        return switch (subRound) {
            case YET_TO_START -> 0;
            case ONE -> 1;
            case TWO -> 2;
            case COMPLETED -> 3;
        };
    }

    public String startMission(String id) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        if (userDocument.getStartTime() == null) {
            Instant now = Instant.now();
            userDocument.setStartTime(now);
            userDocument.setLatestRoundCompleteTime(now);
            userDocumentRepository.save(userDocument);
        }
        return "Mission started!";
    }

    public String updateRound(String id, RoundProgression roundProgression) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        userDocument.setLatestRoundCompleteTime(Instant.now());
        userDocument.setRoundProgression(roundProgression);

        userDocumentRepository.save(userDocument);
        return "Saved!";
    }

    public String updateSubRound(String id, SubRound subRound) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        userDocument.setLatestRoundCompleteTime(Instant.now());
        userDocument.setSubRoundProgression(subRound);

        userDocumentRepository.save(userDocument);
        return "Saved!";
    }

    public Boolean getAckRound(String id, RoundProgression roundProgression) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        RoundProgression completed = userDocument.getRoundProgression();

        return completed.ordinal() == roundProgression.ordinal() - 1;
    }

    public Boolean getAckSubRound(String id, SubRound subRound) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        SubRound completed = userDocument.getSubRoundProgression();

        return completed.ordinal() == subRound.ordinal() - 1;
    }

    public JWTToken authenticate(LoginRequest loginRequest) {
        UserDocument user = userDocumentRepository.findById(loginRequest.teamName());

        if (user == null || !passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            throw new DuplicateCredentialsException("Invalid credentials!");
        }

        boolean isAdmin = user.getRole() == Role.ADMIN;

        if (!isAdmin && user.isLoggedIn()) {
            throw new DuplicateCredentialsException("Already logged in! Each team can only log in once.");
        }

        Instant now = Instant.now();
        String scope = isAdmin ? "ROLE_ADMIN" : "ROLE_USER";

        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .subject(user.getTeamName())
                .issuedAt(now)
                .claim("scope", scope);

        if (!isAdmin) {
            claimsBuilder.expiresAt(now.plus(60, ChronoUnit.MINUTES));
        }

        JwtClaimsSet claims = claimsBuilder.build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(() -> "RS256").build(), claims)
        ).getTokenValue();

        if (!isAdmin) {
            user.setLoggedIn(true);
            userDocumentRepository.save(user);
        }

        return new JWTToken(token);
    }

    public RoundProgression getRoundStatus(String id) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        return userDocumentRepository.findById(id).getRoundProgression();
    }

    public Boolean hasMissionStarted(String id) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        return userDocumentRepository.findById(id).getStartTime() != null;
    }

    @Transactional
    public String sacrificeMate(String id, String teamMemberName) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        if (userDocument.isSacrificed()) {
            throw new DuplicateCredentialsException("Already Sacrificed");
        }

        String[] team = userDocument.getTeamMembers();

        boolean isTeamMatePresent = false;
        for (var member : team) {
            if (member.matches(teamMemberName)) {
                isTeamMatePresent = true;
                break;
            }
        }

        if (!isTeamMatePresent) {
            throw new DuplicateCredentialsException("Team mate with given id doesnt exist!");
        }

        userDocument.setSacrificed(true);
        userDocument.setSacrificedMember(teamMemberName);
        userDocumentRepository.save(userDocument);

        return "Sacrifice successful!";
    }

    public List<String> getTeamMember(String id) {
        if (!userDocumentRepository.existsByTeamName(id)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(id);
        return Arrays.stream(userDocument.getTeamMembers()).toList();
    }

    public String changeAccess(String teamId) {
        if (!userDocumentRepository.existsByTeamName(teamId)) {
            throw new DuplicateCredentialsException("Team name not found!");
        }

        UserDocument userDocument = userDocumentRepository.findById(teamId);
        userDocument.setLoggedIn(false);

        userDocumentRepository.save(userDocument);

        return "Changed!";
    }
}
