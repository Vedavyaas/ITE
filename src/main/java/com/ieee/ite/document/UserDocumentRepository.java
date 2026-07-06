package com.ieee.ite.document;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserDocumentRepository extends MongoRepository<UserDocument, Long> {
    boolean existsByTeamName(String teamName);

    void deleteUserDocumentsById(String id);

    UserDocument findById(String id);
}
