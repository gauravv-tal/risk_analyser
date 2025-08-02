# Multi-stage Docker build for Spring Boot S3 Storage API
# Stage 1: Build the application
FROM maven:3.8-openjdk-11-slim AS build

WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .
# Download all required dependencies into one layer
RUN mvn dependency:go-offline -B

# Copy source files
COPY src ./src

# Build the application
RUN mvn package -DskipTests
RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../s3-storage-api-0.0.1-SNAPSHOT.jar)

# Stage 2: Create the runtime image
FROM eclipse-temurin:11-jre-focal

ARG DEPENDENCY=/app/target/dependency

# Set working directory
WORKDIR /app

# Copy the dependency application layer by layer
COPY --from=build ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY --from=build ${DEPENDENCY}/META-INF /app/META-INF
COPY --from=build ${DEPENDENCY}/BOOT-INF/classes /app

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Create a non-root user to run the application
RUN groupadd -r springuser && useradd -r -g springuser springuser
USER springuser

# Set environment variables (these can be overridden at runtime)
ENV AWS_S3_REGION=ap-south-1
ENV AWS_S3_BUCKET_NAME=sentience-and-sensibility
ENV SERVER_PORT=8080
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Expose the port the app will run on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-cp", "app:app/lib/*", "com.tal.risk.analyser.S3StorageApiApplication"]
