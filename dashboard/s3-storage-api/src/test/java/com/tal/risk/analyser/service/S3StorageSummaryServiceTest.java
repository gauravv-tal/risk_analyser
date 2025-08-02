package com.tal.risk.analyser.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.SummaryStoreRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class S3StorageSummaryServiceTest {

    @Mock
    private AmazonS3 amazonS3;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private S3StorageService s3StorageService;

    private static final String BUCKET_NAME = "test-bucket";
    private static final String PR_ID = "TEST-PR-123";
    private static final String GITHUB_URL = "https://github.com/test/repo";

    @BeforeEach
    void setUp() throws Exception {
        // Set the bucket name via reflection
        java.lang.reflect.Field field = S3StorageService.class.getDeclaredField("bucketName");
        field.setAccessible(true);
        field.set(s3StorageService, BUCKET_NAME);
    }

    @Test
    void storeSummaryDataSuccess() throws Exception {
        // Arrange
        SummaryStoreRequest request = new SummaryStoreRequest();
        SummaryStoreRequest.Content content = new SummaryStoreRequest.Content();
        content.setGithubUrl(GITHUB_URL);
        
        Map<String, Object> data = new HashMap<>();
        data.put("summary", "Test summary");
        data.put("riskScore", 0.75);
        content.setData(data);
        
        request.setContent(content);
        
        Map<String, Object> jsonContent = new HashMap<>();
        jsonContent.put("githubUrl", GITHUB_URL);
        jsonContent.put("data", data);
        
        String jsonData = "{\"githubUrl\":\"" + GITHUB_URL + "\",\"data\":{\"summary\":\"Test summary\",\"riskScore\":0.75}}";
        when(objectMapper.writeValueAsString(any())).thenReturn(jsonData);
        
        // Act
        String s3Key = s3StorageService.storeSummaryData(PR_ID, request);
        
        // Assert
        assertEquals(PR_ID + "/Summary/summary.json", s3Key);
        verify(amazonS3).putObject(eq(BUCKET_NAME), eq(s3Key), any(InputStream.class), any(ObjectMetadata.class));
    }

    @Test
    void storeSummaryDataWithInvalidInput() {
        // Test with null PR_ID
        SummaryStoreRequest request = new SummaryStoreRequest();
        SummaryStoreRequest.Content content = new SummaryStoreRequest.Content();
        content.setGithubUrl(GITHUB_URL);
        content.setData(new HashMap<>());
        request.setContent(content);
        
        Exception exception = assertThrows(RuntimeException.class, () -> {
            s3StorageService.storeSummaryData(null, request);
        });
        
        assertTrue(exception.getMessage().contains("Failed to store summary data in S3"));
        assertTrue(exception.getCause() instanceof IllegalArgumentException);
        assertTrue(exception.getCause().getMessage().contains("PR_ID cannot be empty"));
        
        // Test with null content
        exception = assertThrows(RuntimeException.class, () -> {
            SummaryStoreRequest invalidRequest = new SummaryStoreRequest();
            s3StorageService.storeSummaryData(PR_ID, invalidRequest);
        });
        
        assertTrue(exception.getMessage().contains("Failed to store summary data in S3"));
        assertTrue(exception.getCause() instanceof IllegalArgumentException);
        assertTrue(exception.getCause().getMessage().contains("Github URL and summary data are required"));
    }
}
