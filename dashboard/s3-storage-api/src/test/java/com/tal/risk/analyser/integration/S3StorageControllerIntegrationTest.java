package com.tal.risk.analyser.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.ApiResponse;
import com.tal.risk.analyser.model.CodeRetrieveRequest;
import com.tal.risk.analyser.model.CodeStoreRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-End Integration tests for S3Storage APIs.
 *
 * This test class tests the complete flow from storing data in S3 to retrieving it.
 * These tests connect to a real S3 bucket and should only be run when the necessary
 * AWS credentials are properly configured.
 *
 * Prerequisites:
 * 1. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
 * 2. Set AWS_REGION environment variable (optional, defaults to 'us-east-1')
 * 3. Run with the s3-integration profile: mvn test -Dspring.profiles.active=s3-integration
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("s3-integration")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class S3StorageControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;
    
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

    // Store a unique PR ID to be used across tests
    private static final String TEST_PR_ID = "TEST-E2E-" + UUID.randomUUID().toString().substring(0, 8);
    
    @Test
    @Order(1)
    public void testStoreCodeData() throws Exception {
        System.out.println("Running E2E test with PR_ID: " + TEST_PR_ID);
        
        // Create test file 1
        CodeStoreRequest request1 = new CodeStoreRequest();
        request1.setPrId(TEST_PR_ID);
        
        CodeStoreRequest.Content content1 = new CodeStoreRequest.Content();
        content1.setFileName("E2ETest1.java");
        content1.setTestCases("public class E2ETest1 { /* Test file 1 */ }");
        request1.setContent(content1);

        // Store first file and verify response
        MvcResult storeResult1 = mockMvc.perform(post("/api/v1/store")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Code data stored successfully"))
                .andExpect(jsonPath("$.data.prId").value(TEST_PR_ID))
                .andExpect(jsonPath("$.data.fileName").value("E2ETest1.java"))
                .andReturn();

        // Create test file 2 (to verify multiple files handling)
        CodeStoreRequest request2 = new CodeStoreRequest();
        request2.setPrId(TEST_PR_ID);
        
        CodeStoreRequest.Content content2 = new CodeStoreRequest.Content();
        content2.setFileName("E2ETest2.java");
        content2.setTestCases("public class E2ETest2 { /* Test file 2 */ }");
        request2.setContent(content2);

        // Store second file and verify response
        MvcResult storeResult2 = mockMvc.perform(post("/api/v1/store")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Code data stored successfully"))
                .andExpect(jsonPath("$.data.prId").value(TEST_PR_ID))
                .andExpect(jsonPath("$.data.fileName").value("E2ETest2.java"))
                .andReturn();
                
        // Log the S3 keys for reference
        ApiResponse apiResponse1 = objectMapper.readValue(
                storeResult1.getResponse().getContentAsString(),
                ApiResponse.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> result1 = (Map<String, Object>) apiResponse1.getData();
        
        ApiResponse apiResponse2 = objectMapper.readValue(
                storeResult2.getResponse().getContentAsString(),
                ApiResponse.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> result2 = (Map<String, Object>) apiResponse2.getData();
                
        System.out.println("File 1 stored with S3 key: " + result1.get("s3Key"));
        System.out.println("File 2 stored with S3 key: " + result2.get("s3Key"));
    }
    
    @Test
    @Order(2)
    public void testRetrieveCodeFiles() throws Exception {
        // Create retrieve request
        CodeRetrieveRequest request = new CodeRetrieveRequest();
        request.setPrId(TEST_PR_ID);
        
        // Retrieve files and verify response
        MvcResult retrieveResult = mockMvc.perform(post("/api/v1/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.message").value("Code files retrieved successfully"))
                .andReturn();
        
        // Parse and verify the response
        ApiResponse response = objectMapper.readValue(
                retrieveResult.getResponse().getContentAsString(),
                ApiResponse.class);
        
        @SuppressWarnings("unchecked")
        Map<String, Object> dataMap = (Map<String, Object>) response.getData();
        
        // Should have 2 files
        assertEquals(2, dataMap.get("count"), "Should have retrieved 2 files");
        assertEquals(TEST_PR_ID, dataMap.get("prId"), "PR ID should match");
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> files = (List<Map<String, Object>>) dataMap.get("files");
        
        // Verify file names
        assertEquals("E2ETest1.java", files.get(0).get("id"), "First file should be E2ETest1.java");
        assertEquals("E2ETest2.java", files.get(1).get("id"), "Second file should be E2ETest2.java");
        
        // Verify file contents
        assertTrue(files.get(0).get("testCases").toString().contains("Test file 1"), 
                "First file should contain test content");
        assertTrue(files.get(1).get("testCases").toString().contains("Test file 2"), 
                "Second file should contain test content");
        
        System.out.println("Successfully retrieved " + files.size() + " files for PR_ID: " + TEST_PR_ID);
        System.out.println("Test completed successfully!");
    }
}
