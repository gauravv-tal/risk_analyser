# agents/dependency_analyzer_agent.py
class DependencyAnalyzerAgent:
    def __init__(self, context):
        self.context = context

    def analyze(self):
        impacted_modules = []
        for file_path, content in self.context.items():
            if 'import' in content:
                impacted_modules.append(file_path)
        return impacted_modules
