package com.ieee.ite.document;

import com.ieee.ite.assets.RoundProgression;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserDocumentRepository extends MongoRepository<UserDocument, Long> {
    boolean existsByTeamName(String teamName);

    boolean existsByTeamMembersContaining(String teamMember);

    void deleteUserDocumentsById(String id);

    UserDocument findById(String id);
}
