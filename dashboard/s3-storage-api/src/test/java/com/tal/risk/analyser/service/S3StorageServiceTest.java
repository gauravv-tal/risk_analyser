package com.tal.risk.analyser.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tal.risk.analyser.model.CodeStoreRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
public class S3StorageServiceTest {

    // Use lenient stubs to avoid UnnecessaryStubbingException
    @BeforeEach
    void setLenient() {
        Mockito.lenient().when(amazonS3.putObject(Mockito.anyString(), Mockito.anyString(), 
            Mockito.any(ByteArrayInputStream.class), Mockito.any())).thenReturn(null);
    }

    @Mock
    private AmazonS3 amazonS3;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private S3StorageService s3StorageService;

    @BeforeEach
    void setUp() {
        // Set bucket name using reflection
        ReflectionTestUtils.setField(s3StorageService, "bucketName", "test-bucket");
    }

    @Test
    void testFolderExistsInS3_WhenFolderExists() {
        // Arrange
        String folderPath = "PR-123";
        ListObjectsV2Result mockResult = mock(ListObjectsV2Result.class);
        when(mockResult.getKeyCount()).thenReturn(1);
        when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(mockResult);

        // Act
        boolean exists = s3StorageService.folderExistsInS3(folderPath);

        // Assert
        assertTrue(exists);
        verify(amazonS3).listObjectsV2(any(ListObjectsV2Request.class));
    }

    @Test
    void testFolderExistsInS3_WhenFolderDoesNotExist() {
        // Arrange
        String folderPath = "PR-456";
        ListObjectsV2Result mockResult = mock(ListObjectsV2Result.class);
        when(mockResult.getKeyCount()).thenReturn(0);
        when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(mockResult);

        // Act
        boolean exists = s3StorageService.folderExistsInS3(folderPath);

        // Assert
        assertFalse(exists);
        verify(amazonS3).listObjectsV2(any(ListObjectsV2Request.class));
    }

    @Test
    void testStoreCodeData_Success() throws Exception {
        // Arrange
        CodeStoreRequest request = new CodeStoreRequest();
        request.setPrId("PR-123");
        CodeStoreRequest.Content content = new CodeStoreRequest.Content();
        content.setFileName("TestClass.java");
        content.setTestCases("public class TestClass { }");
        request.setContent(content);

        // Mock folder check
        ListObjectsV2Result mockResult = mock(ListObjectsV2Result.class);
        lenient().when(mockResult.getKeyCount()).thenReturn(0);
        lenient().when(amazonS3.listObjectsV2(any(ListObjectsV2Request.class))).thenReturn(mockResult);

        // Mock JSON serialization
        Map<String, String> jsonContent = Map.of("fileName", "TestClass.java", "testCases", "public class TestClass { }");
        lenient().when(objectMapper.writeValueAsString(any())).thenReturn("{\"fileName\":\"TestClass.java\",\"testCases\":\"public class TestClass { }\"}");

        // Act
        String s3Key = s3StorageService.storeCodeData(request);

        // Assert
        assertNotNull(s3Key);
        assertEquals("PR-123/TestCases/TestClass.java.json", s3Key);
        verify(amazonS3).putObject(eq("test-bucket"), eq(s3Key), any(ByteArrayInputStream.class), any());
    }

    @Test
    void testStoreCodeData_ValidationFailure() {
        // Arrange
        CodeStoreRequest request = new CodeStoreRequest();
        request.setPrId("");  // Empty PR_ID
        CodeStoreRequest.Content content = new CodeStoreRequest.Content();
        content.setFileName("TestClass.java");
        content.setTestCases("public class TestClass { }");
        request.setContent(content);

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            s3StorageService.storeCodeData(request);
        });
        assertTrue(exception.getMessage().contains("PR_ID cannot be empty"));
    }

    @Test
    void testGetCodeData_Success() throws Exception {
        // Arrange
        String s3Key = "PR-123/TestClass.java.json";
        String jsonContent = "{\"fileName\":\"TestClass.java\",\"testCases\":\"public class TestClass { }\"}";
        
        // Mock S3 object
        S3Object mockS3Object = mock(S3Object.class);
        S3ObjectInputStream mockStream = mock(S3ObjectInputStream.class);
        when(mockS3Object.getObjectContent()).thenReturn(mockStream);
        when(mockStream.readAllBytes()).thenReturn(jsonContent.getBytes(StandardCharsets.UTF_8));
        when(amazonS3.getObject(eq("test-bucket"), eq(s3Key))).thenReturn(mockS3Object);
        
        // Mock JSON deserialization
        Map<String, String> expectedData = Map.of("fileName", "TestClass.java", "testCases", "public class TestClass { }");
        when(objectMapper.readValue(eq(jsonContent), eq(Map.class))).thenReturn(expectedData);

        // Act
        Map<String, String> result = s3StorageService.getCodeData(s3Key);

        // Assert
        assertNotNull(result);
        assertEquals(expectedData, result);
        verify(amazonS3).getObject(eq("test-bucket"), eq(s3Key));
    }

    @Test
    void testVerifyUploadedData_WhenDataMatches() throws Exception {
        // Arrange
        String s3Key = "PR-123/TestClass.java.json";
        
        CodeStoreRequest request = new CodeStoreRequest();
        request.setPrId("PR-123");
        CodeStoreRequest.Content content = new CodeStoreRequest.Content();
        content.setFileName("TestClass.java");
        content.setTestCases("public class TestClass { }");
        request.setContent(content);
        
        // Mock Amazon S3 behavior
        S3Object mockS3Object = mock(S3Object.class);
        S3ObjectInputStream mockStream = mock(S3ObjectInputStream.class);
        String jsonContent = "{\"fileName\":\"TestClass.java\",\"testCases\":\"public class TestClass { }\"}";
        when(mockS3Object.getObjectContent()).thenReturn(mockStream);
        when(mockStream.readAllBytes()).thenReturn(jsonContent.getBytes(StandardCharsets.UTF_8));
        when(amazonS3.doesObjectExist(eq("test-bucket"), eq(s3Key))).thenReturn(true);
        when(amazonS3.getObject(eq("test-bucket"), eq(s3Key))).thenReturn(mockS3Object);
        
        // Mock JSON deserialization
        Map<String, String> storedData = Map.of("fileName", "TestClass.java", "testCases", "public class TestClass { }");
        when(objectMapper.readValue(eq(jsonContent), eq(Map.class))).thenReturn(storedData);

        // Act
        boolean result = s3StorageService.verifyUploadedData(s3Key, request);

        // Assert
        assertTrue(result);
    }

    @Test
    void testVerifyUploadedData_WhenDataDoesNotMatch() throws Exception {
        // Arrange
        String s3Key = "PR-123/TestClass.java.json";
        
        CodeStoreRequest request = new CodeStoreRequest();
        request.setPrId("PR-123");
        CodeStoreRequest.Content content = new CodeStoreRequest.Content();
        content.setFileName("TestClass.java");
        content.setTestCases("public class TestClass { }");
        request.setContent(content);
        
        // Mock Amazon S3 behavior
        S3Object mockS3Object = mock(S3Object.class);
        S3ObjectInputStream mockStream = mock(S3ObjectInputStream.class);
        String jsonContent = "{\"fileName\":\"DifferentClass.java\",\"testCases\":\"public class DifferentClass { }\"}";
        when(mockS3Object.getObjectContent()).thenReturn(mockStream);
        when(mockStream.readAllBytes()).thenReturn(jsonContent.getBytes(StandardCharsets.UTF_8));
        when(amazonS3.doesObjectExist(eq("test-bucket"), eq(s3Key))).thenReturn(true);
        when(amazonS3.getObject(eq("test-bucket"), eq(s3Key))).thenReturn(mockS3Object);
        
        // Mock JSON deserialization
        Map<String, String> storedData = Map.of("fileName", "DifferentClass.java", "testCases", "public class DifferentClass { }");
        when(objectMapper.readValue(eq(jsonContent), eq(Map.class))).thenReturn(storedData);

        // Act
        boolean result = s3StorageService.verifyUploadedData(s3Key, request);

        // Assert
        assertFalse(result);
    }
}
