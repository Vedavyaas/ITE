package com.ieee.ite.document;

import io.awspring.cloud.dynamodb.DynamoDbTemplate;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class UserDocumentRepository {

    private final DynamoDbTemplate dynamoDbTemplate;

    public UserDocumentRepository(DynamoDbTemplate dynamoDbTemplate) {
        this.dynamoDbTemplate = dynamoDbTemplate;
    }

    public void save(UserDocument userDocument) {
        dynamoDbTemplate.save(userDocument);
    }

    public UserDocument findById(String id) {
        Key key = Key.builder().partitionValue(id).build();
        return dynamoDbTemplate.load(key, UserDocument.class);
    }

    public List<UserDocument> findAll() {
        PageIterable<UserDocument> pagedResults = dynamoDbTemplate.scanAll(UserDocument.class);
        return pagedResults.items().stream().collect(Collectors.toList());
    }

    public void deleteUserDocumentsById(String id) {
        Key key = Key.builder().partitionValue(id).build();
        dynamoDbTemplate.delete(key, UserDocument.class);
    }

    public long count() {
        // Warning: This does a full table scan. 
        // Acceptable here because it's only used by DataSeeder on startup.
        return dynamoDbTemplate.scanAll(UserDocument.class).items().stream().count();
    }

    public boolean existsByTeamName(String teamName) {
        // In the previous service logic, teamName was used interchangeably with ID
        return findById(teamName) != null;
    }

    public boolean existsByTeamMembersContaining(String teamMember) {
        Map<String, AttributeValue> expressionValues = new HashMap<>();
        expressionValues.put(":member", AttributeValue.builder().s(teamMember).build());

        Expression expression = Expression.builder()
                .expression("contains(teamMembers, :member)")
                .expressionValues(expressionValues)
                .build();

        ScanEnhancedRequest scanRequest = ScanEnhancedRequest.builder()
                .filterExpression(expression)
                .build();

        PageIterable<UserDocument> results = dynamoDbTemplate.scan(scanRequest, UserDocument.class);
        return results.items().iterator().hasNext();
    }
}
