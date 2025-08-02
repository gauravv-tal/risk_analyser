# S3 Storage API

A Java microservice application for storing data in an S3 bucket.

## Overview

This service provides an API to store code data in an S3 bucket. It accepts POST requests containing PR ID, file name, and code content, and stores this data in JSON format in the S3 bucket at the path `/{PR_ID}/*.json`.

## Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- AWS account with S3 bucket
- AWS credentials configured (via environment variables, AWS credentials file, or IAM role)

## Configuration

Edit the `application.properties` file to set the following properties:

```properties
aws.s3.region=us-east-1                # AWS region where your S3 bucket is located
aws.s3.bucket-name=your-bucket-name    # Name of your S3 bucket
```

## Building and Running the Application

### Building

```bash
mvn clean package
```

### Running

```bash
java -jar target/s3-storage-api-0.0.1-SNAPSHOT.jar
```

Or using Maven:

```bash
mvn spring-boot:run
```

## Docker Support

This application can be containerized for easier deployment and consistency across environments.

### Building the Docker Image

```bash
docker build -t s3-storage-api:latest .
```

### Running with Docker

```bash
docker run -d -p 8080:8080 \
  -e AWS_S3_REGION=ap-south-1 \
  -e AWS_S3_BUCKET_NAME=sentience-and-sensibility \
  -e AWS_ACCESS_KEY_ID=your-access-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret-key \
  --name s3-storage-api \
  s3-storage-api:latest
```

### Using Docker Compose

For local development with Docker Compose:

```bash
docker-compose up -d
```

For local testing with LocalStack (mock S3):

```bash
# Uncomment the LocalStack service in docker-compose.yml first
docker-compose up -d

# Create a test bucket in LocalStack
aws --endpoint-url=http://localhost:4566 s3 mb s3://your-bucket-name
```

## API Endpoints

### Store Code Data

**Endpoint**: `POST /api/v1/store`

**Request Body**:
```json
{
  "PR_ID": "PR-123",
  "CONTENT": {
    "File_Name": "some-test-class.java",
    "Test_Cases": "public class SomeTestClass { ... }"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Code data stored successfully",
  "data": {
    "prId": "PR-123",
    "fileName": "some-test-class.java",
    "s3Key": "PR-123/some-test-class.java.json"
  }
}
```

### Retrieve Code Data

**Endpoint**: `POST /api/v1/retrieve`

**Request Body**:
```json
{
  "PR_ID": "PR-123"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Code files retrieved successfully",
  "data": [
    {
      "id": "class1.java",
      "test_cases": "public class Class1 { /* code here */ }"
    },
    {
      "id": "class2.java",
      "test_cases": "public class Class2 { /* code here */ }"
    }
  ]
}
```

**Error Responses**:

1. PR_ID doesn't exist:
```json
{
  "status": "error",
  "message": "No data found for PR_ID: PR-123",
  "data": null
}
```

2. PR_ID exists but has no files:
```json
{
  "status": "error",
  "message": "No files found for PR_ID: PR-123",
  "data": null
}
```

3. Other errors:
```json
{
  "status": "error",
  "message": "Failed to retrieve code files: [error message]",
  "data": null
}
```

### Store Summary Data

**Endpoint**: `POST /api/v1/summary/store`

**Request Body**:
```json
{
  "prId": "PR-123",
  "content": {
    "githubUrl": "https://github.com/example/repo/pull/123",
    "data": {
      "codeMetrics": {
        "linesOfCode": 1250,
        "complexity": 42,
        "coverage": 87.5
      },
      "securityIssues": {
        "critical": 2,
        "high": 5,
        "medium": 12,
        "low": 8
      },
      "author": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "timestamp": "2025-08-02T10:15:30Z"
      },
      "analysisTimestamp": "2025-08-02T10:20:45Z",
      "description": "This PR adds new risk analysis features"
    }
  }
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Summary data stored successfully",
  "data": {
    "prId": "PR-123",
    "s3Key": "PR-123/Summary/summary.json"
  }
}
```

**Error Responses**:

1. Validation error:
```json
{
  "status": "error",
  "message": "Validation error: Github URL and summary data are required",
  "data": null
}
```

2. Other errors:
```json
{
  "status": "error",
  "message": "Failed to store summary data: [error message]",
  "data": null
}
```

### Retrieve Summary Data

**Endpoint**: `POST /api/v1/summary/retrieve`

**Request Body**:
```json
{
  "prId": "PR-123"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Summary data retrieved successfully",
  "data": {
    "prId": "PR-123",
    "summaryData": {
      "githubUrl": "https://github.com/example/repo/pull/123",
      "data": "Summary content goes here..."
    }
  }
}
```

**Alternative Endpoint**: `GET /api/v1/summary/retrieve/{prId}`

This endpoint provides the same functionality but uses a GET request with the PR ID as a path variable.

**Error Responses**:

1. PR_ID is empty:
```json
{
  "status": "error",
  "message": "Validation error: PR ID cannot be empty",
  "data": null
}
```

2. Summary not found:
```json
{
  "status": "error",
  "message": "Failed to retrieve summary data: Summary data not found for PR ID: PR-123",
  "data": null
}
```

### Health Check

**Endpoint**: `GET /api/v1/health`

**Response**:
```json
{
  "status": "success",
  "message": "S3 Storage API is running",
  "data": null
}
```

## AWS Credentials

The application uses environment variables for AWS credentials. Before running the application, you need to set the following environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

You can use the provided `run.sh` script which sets these environment variables and runs the application:

```bash
./run.sh
```

If the environment variables are not set, the application will fall back to the default AWS credential provider chain, which looks for credentials in the following order:

1. Environment variables: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
2. Java system properties: `aws.accessKeyId` and `aws.secretKey`
3. AWS credentials file (default location: `~/.aws/credentials`)
4. Container credentials (ECS container role)
5. Instance profile credentials (EC2 instance role)

## Error Handling

The API returns appropriate HTTP status codes and error messages for different types of errors:

- `400 Bad Request`: For invalid input parameters
- `500 Internal Server Error`: For server-side errors

## Logging

Logs are output to the console by default. You can modify the logging configuration in the `application.properties` file.

## Testing

### Unit Tests

The application includes unit tests for the S3StorageService class. These tests use Mockito to mock the AWS S3 client and do not require actual AWS credentials.

```bash
mvn test
```

### Integration Tests

The application includes integration tests that actually connect to S3 and perform real operations. These tests require AWS credentials and will create test files in your S3 bucket.

To run the integration tests:

```bash
# Set AWS credentials and run integration tests
./run-s3-integration-tests.sh
```

The integration tests will:
1. Create test files in the S3 bucket with unique identifiers
2. Verify the files were uploaded correctly
3. Verify the data in the files matches what was sent

### End-to-End (E2E) Tests

The application includes comprehensive E2E tests that test both the store and retrieve API endpoints using a real S3 bucket. These tests create test files with unique identifiers and then retrieve and verify them.

To run the E2E tests:

```bash
# Set AWS credentials and run E2E tests
./run-e2e-tests.sh
```

### Test Cleanup

After running tests, you can clean up the test data from your S3 bucket using the provided cleanup scripts:

```bash
# Interactive cleanup (with confirmations)
./cleanup-s3-tests.sh

# Automated cleanup (no confirmations)
./cleanup-s3-tests-auto.sh
```

### All-in-One E2E Testing and Cleanup

For convenience, you can run the E2E tests and clean up the test data in one step:

```bash
# Run E2E tests and clean up afterward
./run-e2e-tests-with-cleanup.sh

# Additional options:
./run-e2e-tests-with-cleanup.sh --skip-tests     # Only clean up, don't run tests
./run-e2e-tests-with-cleanup.sh --skip-cleanup   # Only run tests, don't clean up
./run-e2e-tests-with-cleanup.sh --debug          # Run with additional debug output
```

**Note:** All integration and E2E tests will create files in your S3 bucket with names starting with "TEST-PR-" or "TEST-E2E-". These are safe to delete after testing, and the cleanup scripts will remove them for you.

## S3 Bucket Exploration Tools

The project includes several scripts to help you explore and manage the S3 bucket. All scripts automatically load AWS credentials from:

1. Environment variables (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) if set
2. The `run.sh` script in the project root
3. The application properties file (`src/test/resources/application-s3-integration.properties`)

### List All Contents

List all folders and files recursively in the S3 bucket:

```bash
# Simple listing of all content
./list-s3-contents.sh

# Show content in tree format
./list-s3-contents.sh --tree

# Filter by prefix
./list-s3-contents.sh --prefix=your-prefix

# Show file sizes
./list-s3-contents.sh --show-size

# Combine options
./list-s3-contents.sh --tree --prefix=TEST-PR- --show-size
```

### Visualize Folder Structure

Generate a visual tree of the S3 bucket folder structure:

```bash
# Display the folder structure
./visualize-s3-structure.sh

# Specify a starting prefix
./visualize-s3-structure.sh --prefix=your-prefix

# Limit the depth of folders to display
./visualize-s3-structure.sh --depth=2

# Show the number of files in each folder
./visualize-s3-structure.sh --count-files
```

### View Files for a Specific PR_ID

List and optionally download all files for a specific PR_ID:

```bash
# List files for a PR_ID
./list-pr-files.sh PR-12345

# Download files locally
./list-pr-files.sh PR-12345 --download

# Show file contents
./list-pr-files.sh PR-12345 --show-content

# Format JSON content
./list-pr-files.sh PR-12345 --show-content --format

# Specify output directory for downloads
./list-pr-files.sh PR-12345 --download --output-dir=./my-downloads
```

These tools help you verify data in the S3 bucket, debug issues, and manage your application's storage.
