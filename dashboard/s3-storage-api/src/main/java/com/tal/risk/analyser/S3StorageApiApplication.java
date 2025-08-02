package com.tal.risk.analyser;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class S3StorageApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(S3StorageApiApplication.class, args);
    }
    
    /**
     * Global CORS configuration for all controllers
     * This configuration allows all origins but disables credentials
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("*")  // Allow all origins
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)  // Disable credentials for wildcard origin
                        .maxAge(3600);
            }
        };
    }
}
