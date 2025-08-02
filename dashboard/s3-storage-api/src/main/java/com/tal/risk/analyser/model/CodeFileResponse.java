package com.tal.risk.analyser.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeFileResponse {
    private String id;
    private String content;
    private String testCases;
    
    public CodeFileResponse(String id, String content) {
        this.id = id;
        this.content = content;
        this.testCases = content; // For backward compatibility
    }
}
