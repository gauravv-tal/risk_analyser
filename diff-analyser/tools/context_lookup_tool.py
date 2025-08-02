# tools/context_lookup_tool.py

import json
import os
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

class FileInput(BaseModel):
    file_path: str = Field(description="The file path to analyze for dependencies")

class ContextLookupTool(BaseTool):
    def __init__(self, context_path):
        super().__init__()
        self._context_path = context_path
        self._load_context()

    def _load_context(self):
        if os.path.exists(self._context_path):
            with open(self._context_path, 'r') as f:
                self._context = json.load(f)
        else:
            self._context = {}

    def find_related_modules(self, changed_file):
        """
        Return related modules (direct or indirect dependencies) for a given file.
        """
        return self._context.get(changed_file, {}).get("related_modules", [])

    def get_test_coverage(self, module):
        """
        Return known test coverage info for a given module.
        """
        return self._context.get(module, {}).get("test_coverage", "unknown")
    
    def _run(self, file_path: str):
        """Required method for CrewAI tools"""
        return self.find_related_modules(file_path)
    
    @property
    def name(self):
        return "Context Lookup Tool"
    
    @property
    def description(self):
        return "Finds related modules and dependencies for a given file"
    
    @property
    def args_schema(self):
        return FileInput

# Example context.json:
# {
#   "billing/payment_service.py": {
#     "related_modules": ["core/auth.py", "utils/logger.py"],
#     "test_coverage": "medium"
#   },
#   "core/auth.py": {
#     "related_modules": ["utils/validator.py"],
#     "test_coverage": "high"
#   }
# }
