package com.tal.risk.analyser.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.CodeFileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class S3FileRetrievalTest {

    @Mock
    private AmazonS3 amazonS3;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private S3StorageService s3StorageService;

    private final String testBucket = "test-bucket";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(s3StorageService, "bucketName", testBucket);
    }

    @Test
    void testGetAllCodeFilesForPR_Success() throws Exception {
        // Arrange
        String prId = "PR-123";
        
        // Mock S3 object listing
        ListObjectsV2Result mockResult = mock(ListObjectsV2Result.class);
        when(mockResult.getKeyCount()).thenReturn(2);
        
        List<S3ObjectSummary> objectSummaries = new ArrayList<>();
        S3ObjectSummary obj1 = new S3ObjectSummary();
        obj1.setKey("PR-123/TestCases/file1.json");
        S3ObjectSummary obj2 = new S3ObjectSummary();
        obj2.setKey("PR-123/TestCases/file2.json");
        objectSummaries.add(obj1);
        objectSummaries.add(obj2);
        
        when(mockResult.getObjectSummaries()).thenReturn(objectSummaries);
        when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(mockResult);
        
        // Mock S3 object content
        S3Object mockS3Object1 = mock(S3Object.class);
        S3ObjectInputStream mockStream1 = mock(S3ObjectInputStream.class);
        String json1 = "{\"fileName\":\"file1.java\",\"testCases\":\"public class File1 {}\"}";
        when(mockS3Object1.getObjectContent()).thenReturn(mockStream1);
        when(mockStream1.readAllBytes()).thenReturn(json1.getBytes(StandardCharsets.UTF_8));
        when(amazonS3.getObject(eq(testBucket), eq("PR-123/TestCases/file1.json"))).thenReturn(mockS3Object1);
        
        S3Object mockS3Object2 = mock(S3Object.class);
        S3ObjectInputStream mockStream2 = mock(S3ObjectInputStream.class);
        String json2 = "{\"fileName\":\"file2.java\",\"testCases\":\"public class File2 {}\"}";
        when(mockS3Object2.getObjectContent()).thenReturn(mockStream2);
        when(mockStream2.readAllBytes()).thenReturn(json2.getBytes(StandardCharsets.UTF_8));
        when(amazonS3.getObject(eq(testBucket), eq("PR-123/TestCases/file2.json"))).thenReturn(mockS3Object2);
        
        // Mock JSON deserialization
        Map<String, String> map1 = new HashMap<>();
        map1.put("fileName", "file1.java");
        map1.put("testCases", "public class File1 {}");
        
        Map<String, String> map2 = new HashMap<>();
        map2.put("fileName", "file2.java");
        map2.put("testCases", "public class File2 {}");
        
        when(objectMapper.readValue(eq(json1), eq(Map.class))).thenReturn(map1);
        when(objectMapper.readValue(eq(json2), eq(Map.class))).thenReturn(map2);
        
        // Act
        List<CodeFileResponse> result = s3StorageService.getAllCodeFilesForPR(prId);
        
        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("file1.java", result.get(0).getId());
        assertEquals("public class File1 {}", result.get(0).getTestCases());
        assertEquals("file2.java", result.get(1).getId());
        assertEquals("public class File2 {}", result.get(1).getTestCases());
    }
    
    @Test
    void testGetAllCodeFilesForPR_EmptyFolder() {
        // Arrange
        String prId = "PR-456";
        
        // Mock folder exists but no files
        ListObjectsV2Result mockResult = mock(ListObjectsV2Result.class);
        when(mockResult.getKeyCount()).thenReturn(0);
        when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(mockResult);
        
        // Act & Assert
        Exception exception = assertThrows(NoSuchElementException.class, () -> {
            s3StorageService.getAllCodeFilesForPR(prId);
        });
        
        assertTrue(exception.getMessage().contains("No data found for PR_ID"));
    }
    
    @Test
    void testGetAllCodeFilesForPR_FolderDoesNotExist() {
        // Arrange
        String prId = "PR-789";
        
        // Mock folder does not exist
        ListObjectsV2Result mockResult = mock(ListObjectsV2Result.class);
        when(mockResult.getKeyCount()).thenReturn(0);
        when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(mockResult);
        
        // Act & Assert
        Exception exception = assertThrows(NoSuchElementException.class, () -> {
            s3StorageService.getAllCodeFilesForPR(prId);
        });
        
        assertTrue(exception.getMessage().contains("No data found for PR_ID"));
    }
}
