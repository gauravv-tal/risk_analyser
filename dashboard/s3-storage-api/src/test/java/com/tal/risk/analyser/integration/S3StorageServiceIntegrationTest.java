package com.tal.risk.analyser.integration;

import com.tal.risk.analyser.model.CodeStoreRequest;
import com.tal.risk.analyser.service.S3StorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for S3StorageService.
 * 
 * NOTE: These tests actually connect to S3 and will upload files.
 * They are intended to be run manually with the s3-integration profile active.
 * 
 * To run these tests, you need to:
 * 1. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
 * 2. Run with the s3-integration profile: mvn test -Dspring.profiles.active=s3-integration
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@ActiveProfiles("s3-integration")
public class S3StorageServiceIntegrationTest {

    @Autowired
    private S3StorageService s3StorageService;
    
    @BeforeEach
    void setUp() throws Exception {
        // Set AWS credentials from run.sh
        String runShContent = java.nio.file.Files.readString(
            java.nio.file.Paths.get(System.getProperty("user.dir") + "/run.sh"));
        
        java.util.regex.Pattern accessKeyPattern = 
            java.util.regex.Pattern.compile("AWS_ACCESS_KEY_ID=([A-Za-z0-9]+)");
        java.util.regex.Pattern secretKeyPattern = 
            java.util.regex.Pattern.compile("AWS_SECRET_ACCESS_KEY=([A-Za-z0-9/+]+)");
        java.util.regex.Pattern regionPattern = 
            java.util.regex.Pattern.compile("AWS_REGION=([a-z0-9-]+)");
            
        java.util.regex.Matcher accessKeyMatcher = accessKeyPattern.matcher(runShContent);
        java.util.regex.Matcher secretKeyMatcher = secretKeyPattern.matcher(runShContent);
        java.util.regex.Matcher regionMatcher = regionPattern.matcher(runShContent);
        
        if (accessKeyMatcher.find() && secretKeyMatcher.find()) {
            String accessKey = accessKeyMatcher.group(1);
            String secretKey = secretKeyMatcher.group(1);
            String region = regionMatcher.find() ? regionMatcher.group(1) : "ap-south-1";
            
            System.setProperty("aws.accessKeyId", accessKey);
            System.setProperty("aws.secretKey", secretKey);
            System.setProperty("aws.region", region);
            
            System.out.println("AWS credentials loaded from run.sh for tests");
        } else {
            System.out.println("Could not find AWS credentials in run.sh");
        }
    }

    @Test
    void testStoreAndVerifyCodeData() throws Exception {
        // Generate a unique PR ID for testing to avoid polluting S3
        String testPrId = "TEST-PR-" + UUID.randomUUID().toString().substring(0, 8);
        
        // Create test request
        CodeStoreRequest request = new CodeStoreRequest();
        request.setPrId(testPrId);
        CodeStoreRequest.Content content = new CodeStoreRequest.Content();
        content.setFileName("IntegrationTest.java");
        content.setTestCases("public class IntegrationTest { /* This is a test */ }");
        request.setContent(content);
        
        // Store data in S3
        String s3Key = s3StorageService.storeCodeData(request);
        
        // Verify data was uploaded successfully
        assertNotNull(s3Key);
        assertEquals(testPrId + "/TestCases/IntegrationTest.java.json", s3Key);
        
        // Retrieve and verify data
        Map<String, String> retrievedData = s3StorageService.getCodeData(s3Key);
        assertNotNull(retrievedData);
        assertEquals("IntegrationTest.java", retrievedData.get("fileName"));
        assertEquals("public class IntegrationTest { /* This is a test */ }", retrievedData.get("testCases"));
        
        // Verify using the verification method
        boolean verified = s3StorageService.verifyUploadedData(s3Key, request);
        assertTrue(verified);
    }
    
    @Test
    void testFolderExistsInS3() {
        // Generate a unique PR ID
        String testPrId = "TEST-PR-" + UUID.randomUUID().toString().substring(0, 8);
        
        // Initially the folder should not exist
        boolean folderExistsBefore = s3StorageService.folderExistsInS3(testPrId);
        assertFalse(folderExistsBefore, "Folder should not exist before creating any files");
        
        // Create and store a test file
        CodeStoreRequest request = new CodeStoreRequest();
        request.setPrId(testPrId);
        CodeStoreRequest.Content content = new CodeStoreRequest.Content();
        content.setFileName("FolderTest.java");
        content.setTestCases("// Test content");
        request.setContent(content);
        
        // Store data in S3
        s3StorageService.storeCodeData(request);
        
        // Now the folder should exist
        boolean folderExistsAfter = s3StorageService.folderExistsInS3(testPrId);
        assertTrue(folderExistsAfter, "Folder should exist after creating a file");
    }
}
