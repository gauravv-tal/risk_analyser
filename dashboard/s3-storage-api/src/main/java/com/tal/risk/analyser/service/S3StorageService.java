package com.tal.risk.analyser.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.CodeFileResponse;
import com.tal.risk.analyser.model.CodeStoreRequest;
import com.tal.risk.analyser.model.SummaryStoreRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class S3StorageService {

    @Autowired
    private AmazonS3 amazonS3;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Stores code data in S3 for a specific PR ID
     *
     * @param codeStoreRequest The code data to store
     * @return S3 object key of the stored file
     */
    public String storeCodeData(CodeStoreRequest codeStoreRequest) {
        return storeCodeData(codeStoreRequest.getPrId(), codeStoreRequest);
    }

    /**
     * Stores code data in S3 for a specific PR ID
     *
     * @param prId           Pull Request ID
     * @param codeStoreRequest The code data to store
     * @return S3 object key of the stored file
     * @throws IllegalArgumentException if the request is invalid
     */
    public String storeCodeData(String prId, CodeStoreRequest codeStoreRequest) {
        try {
            // Validate inputs
            if (prId == null || prId.trim().isEmpty()) {
                throw new IllegalArgumentException("PR_ID cannot be empty");
            }
            
            if (codeStoreRequest == null || codeStoreRequest.getContent() == null || 
                codeStoreRequest.getContent().getFileName() == null || 
                codeStoreRequest.getContent().getFileName().trim().isEmpty() ||
                codeStoreRequest.getContent().getTestCases() == null) {
                throw new IllegalArgumentException("Filename and test cases are required");
            }
            
            // Use the fileName directly for the S3 key instead of adding timestamp and UUID
            String sanitizedFileName = codeStoreRequest.getContent().getFileName().replaceAll("[^a-zA-Z0-9.-]", "_");
            
            // Format: /{PR_ID}/TestCases/{sanitizedFileName}.json - this will overwrite any existing file with the same name
            String s3Key = String.format("%s/TestCases/%s.json", prId, sanitizedFileName);
            
            // Create JSON content with the code data
            Map<String, String> jsonContent = new HashMap<>();
            jsonContent.put("fileName", codeStoreRequest.getContent().getFileName());
            jsonContent.put("testCases", codeStoreRequest.getContent().getTestCases());
            
            String jsonData = objectMapper.writeValueAsString(jsonContent);
            byte[] contentBytes = jsonData.getBytes(StandardCharsets.UTF_8);
            
            // Set metadata for the S3 object
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentBytes.length);
            metadata.setContentType("application/json");
            
            // Upload the file to S3
            amazonS3.putObject(
                bucketName, 
                s3Key, 
                new ByteArrayInputStream(contentBytes), 
                metadata
            );
            
            log.info("Successfully stored code data for PR: {}, file: {}, S3 key: {}", 
                prId, codeStoreRequest.getContent().getFileName(), s3Key);
            
            return s3Key;
        } catch (IllegalArgumentException e) {
            // Rethrow validation errors
            log.error("Validation error storing code data in S3 for PR: " + prId, e);
            throw e;
        } catch (Exception e) {
            log.error("Error storing code data in S3 for PR: " + prId, e);
            throw new RuntimeException("Failed to store code data in S3", e);
        }
    }
    
    /**
     * Stores summary data in S3 for a specific PR ID
     *
     * @param prId The Pull Request ID
     * @param summaryStoreRequest The summary data to store
     * @return S3 object key of the stored file
     */
    public String storeSummaryData(String prId, SummaryStoreRequest summaryStoreRequest) {
        try {
            // Validate required fields
            if (prId == null || prId.trim().isEmpty()) {
                throw new IllegalArgumentException("PR_ID cannot be empty");
            }
            
            if (summaryStoreRequest.getContent() == null || 
                summaryStoreRequest.getContent().getGithubUrl() == null || 
                summaryStoreRequest.getContent().getGithubUrl().trim().isEmpty() ||
                summaryStoreRequest.getContent().getData() == null) {
                throw new IllegalArgumentException("Github URL and summary data are required");
            }
            
            // Format: /{PR_ID}/Summary/summary.json
            String s3Key = String.format("%s/Summary/summary.json", prId);
            
            // Create JSON content with the summary data
            Map<String, Object> jsonContent = new HashMap<>();
            jsonContent.put("githubUrl", summaryStoreRequest.getContent().getGithubUrl());
            jsonContent.put("data", summaryStoreRequest.getContent().getData());
            
            String jsonData = objectMapper.writeValueAsString(jsonContent);
            byte[] contentBytes = jsonData.getBytes(StandardCharsets.UTF_8);
            
            // Set metadata for the S3 object
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(contentBytes.length);
            metadata.setContentType("application/json");
            
            // Upload the file to S3 (overwrite if exists)
            amazonS3.putObject(
                bucketName, 
                s3Key, 
                new ByteArrayInputStream(contentBytes), 
                metadata
            );
            
            log.info("Successfully stored summary data for PR: {}, S3 key: {}", prId, s3Key);
            
            return s3Key;
        } catch (Exception e) {
            log.error("Error storing summary data in S3 for PR: " + prId, e);
            throw new RuntimeException("Failed to store summary data in S3", e);
        }
    }
    
    /**
     * Checks if a folder exists in S3 bucket
     *
     * @param folderPath Folder path in S3
     * @return True if folder exists, false otherwise
     */
    public boolean folderExistsInS3(String folderPath) {
        try {
            String prefix = folderPath;
            if (!prefix.endsWith("/")) {
                prefix = prefix + "/";
            }
            
            // First check if the folder key itself exists (S3 doesn't have real folders, just objects with prefixes)
            boolean exactKeyExists = amazonS3.doesObjectExist(bucketName, prefix);
            if (exactKeyExists) {
                return true;
            }
            
            // If the exact key doesn't exist, check if there are any objects with this prefix
            com.amazonaws.services.s3.model.ListObjectsV2Request request = new com.amazonaws.services.s3.model.ListObjectsV2Request()
                .withBucketName(bucketName)
                .withPrefix(prefix)
                .withMaxKeys(1);
                
            com.amazonaws.services.s3.model.ListObjectsV2Result result = amazonS3.listObjectsV2(request);
            
            return result.getKeyCount() > 0;
        } catch (Exception e) {
            log.error("Error checking if folder exists in S3: {}", folderPath, e);
            return false;
        }
    }
    
    /**
     * Retrieves code data from S3 for a specific PR ID
     *
     * @param prId The Pull Request ID or S3 key
     * @return Map containing the retrieved code data
     */
    public Map<String, String> getCodeData(String prId) {
        try {
            // Check if the prId is a full S3 key (contains .json)
            if (prId.endsWith(".json")) {
                // Use the prId as the full S3 key
                String key = prId;
                
                // Get the object content
                com.amazonaws.services.s3.model.S3Object s3Object = amazonS3.getObject(bucketName, key);
                byte[] content = s3Object.getObjectContent().readAllBytes();
                String jsonContent = new String(content, java.nio.charset.StandardCharsets.UTF_8);
                
                // Parse the JSON content
                Map<String, String> codeData = objectMapper.readValue(jsonContent, Map.class);
                
                return codeData;
            } else {
                // List all objects with the PR ID prefix
                String prefix = prId + "/";
                
                com.amazonaws.services.s3.model.ListObjectsV2Request request = new com.amazonaws.services.s3.model.ListObjectsV2Request()
                    .withBucketName(bucketName)
                    .withPrefix(prefix)
                    .withMaxKeys(1);  // We only need one file for testing
                    
                com.amazonaws.services.s3.model.ListObjectsV2Result result = amazonS3.listObjectsV2(request);
                
                if (result.getKeyCount() == 0) {
                    throw new RuntimeException("No data found for PR_ID: " + prId);
                }
                
                // Get the first object's key
                String key = result.getObjectSummaries().get(0).getKey();
                
                // Get the object content
                com.amazonaws.services.s3.model.S3Object s3Object = amazonS3.getObject(bucketName, key);
                byte[] content = s3Object.getObjectContent().readAllBytes();
                String jsonContent = new String(content, java.nio.charset.StandardCharsets.UTF_8);
                
                // Parse the JSON content
                Map<String, String> codeData = objectMapper.readValue(jsonContent, Map.class);
                
                return codeData;
            }
        } catch (Exception e) {
            log.error("Error retrieving code data from S3 for PR: {}", prId, e);
            throw new RuntimeException("Failed to retrieve code data from S3", e);
        }
    }
    
    /**
     * Retrieves summary data from S3 for a specific PR ID
     *
     * @param prId The PR ID for which to retrieve summary data
     * @return Map containing the retrieved summary data
     * @throws RuntimeException if retrieval fails
     */
    public Map<String, Object> getSummaryData(String prId) {
        try {
            // Validate PR ID
            if (prId == null || prId.trim().isEmpty()) {
                throw new IllegalArgumentException("PR_ID cannot be empty");
            }
            
            // Format: /{PR_ID}/Summary/summary.json
            String s3Key = String.format("%s/Summary/summary.json", prId);
            
            // Get the object from S3
            com.amazonaws.services.s3.model.S3Object s3Object = amazonS3.getObject(bucketName, s3Key);
            byte[] content = s3Object.getObjectContent().readAllBytes();
            String jsonContent = new String(content, StandardCharsets.UTF_8);
            
            // Parse the JSON content
            return objectMapper.readValue(jsonContent, new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (com.amazonaws.services.s3.model.AmazonS3Exception e) {
            if (e.getStatusCode() == 404) {
                // Object not found
                log.error("Summary data not found for PR ID: {}", prId);
                throw new RuntimeException("Summary data not found for PR ID: " + prId, e);
            }
            log.error("Error retrieving summary data from S3 for PR: {}", prId, e);
            throw new RuntimeException("Failed to retrieve summary data from S3: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error retrieving summary data from S3 for PR: {}", prId, e);
            throw new RuntimeException("Failed to retrieve summary data from S3", e);
        }
    }
    
    /**
     * Verifies that the uploaded data exists in S3
     *
     * @param s3Key The S3 key of the stored file
     * @param request The original code store request
     * @return True if the verification passes, false otherwise
     */
    public boolean verifyUploadedData(String s3Key, CodeStoreRequest request) {
        try {
            if (s3Key == null || s3Key.isEmpty()) {
                return false;
            }
            
            // Check if the object exists in S3
            boolean objectExists = amazonS3.doesObjectExist(bucketName, s3Key);
            if (!objectExists) {
                return false;
            }
            
            // Get the object content
            com.amazonaws.services.s3.model.S3Object s3Object = amazonS3.getObject(bucketName, s3Key);
            byte[] content = s3Object.getObjectContent().readAllBytes();
            String jsonContent = new String(content, java.nio.charset.StandardCharsets.UTF_8);
            
            // Parse the JSON content
            Map<String, String> storedData = objectMapper.readValue(jsonContent, Map.class);
            
            // Verify that the stored data matches the request
            String expectedFileName = request.getContent().getFileName();
            String storedFileName = storedData.get("fileName");
            
            String expectedTestCases = request.getContent().getTestCases();
            String storedTestCases = storedData.get("testCases");
            
            return expectedFileName.equals(storedFileName) && expectedTestCases.equals(storedTestCases);
        } catch (Exception e) {
            log.error("Error verifying uploaded data in S3 for PR: {}", request.getPrId(), e);
            return false;
        }
    }
    
    /**
     * Retrieves all code files for a specific PR ID
     *
     * @param prId The Pull Request ID
     * @return List of CodeFileResponse objects
     * @throws NoSuchElementException if no files are found for the PR ID
     */
    public java.util.List<CodeFileResponse> getAllCodeFilesForPR(String prId) {
        try {
            String prefix = prId + "/TestCases/";
            
            // List all objects with the PR ID/TestCases prefix
            com.amazonaws.services.s3.model.ListObjectsV2Request request = new com.amazonaws.services.s3.model.ListObjectsV2Request()
                .withBucketName(bucketName)
                .withPrefix(prefix);
                
            com.amazonaws.services.s3.model.ListObjectsV2Result result = amazonS3.listObjectsV2(request);
            
            if (result.getKeyCount() == 0) {
                throw new java.util.NoSuchElementException("No data found for PR_ID: " + prId);
            }
            
            java.util.List<CodeFileResponse> files = new java.util.ArrayList<>();
            
            for (com.amazonaws.services.s3.model.S3ObjectSummary objectSummary : result.getObjectSummaries()) {
                String key = objectSummary.getKey();
                
                // Skip if this is a folder or not a JSON file
                if (key.endsWith("/") || !key.endsWith(".json")) {
                    continue;
                }
                
                // Get the object content
                com.amazonaws.services.s3.model.S3Object s3Object = amazonS3.getObject(bucketName, key);
                byte[] content = s3Object.getObjectContent().readAllBytes();
                String jsonContent = new String(content, java.nio.charset.StandardCharsets.UTF_8);
                
                // Parse the JSON content
                java.util.Map<String, String> map = objectMapper.readValue(jsonContent, java.util.Map.class);
                
                // Create a CodeFileResponse object
                // Use the fileName from the stored JSON content
                String fileName = map.get("fileName");
                String testCases = map.get("testCases");
                
                files.add(new CodeFileResponse(fileName, testCases));
            }
            
            return files;
        } catch (java.util.NoSuchElementException e) {
            // Rethrow NoSuchElementException to be caught by the caller
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving all code files from S3 for PR: {}", prId, e);
            return java.util.Collections.emptyList();
        }
    }
}
