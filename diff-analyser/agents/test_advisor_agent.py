# agents/test_advisor_agent.py
import re

class TestAdvisorAgent:
    def __init__(self, context):
        self.context = context

    def suggest_tests(self, impacted_modules):
        suggestions = {}
        for module in impacted_modules:
            content = self.context.get(module, "")
            func_names = re.findall(r'def (test_\w+|\w+)', content)
            untested_funcs = [f for f in func_names if not f.startswith("test_")]

            suggestions[module] = []
            for func in untested_funcs:
                suggestions[module].append(
                    f"Add test for `{func}` function in `{module}`"
                )

            if not suggestions[module]:
                suggestions[module].append("All major functions appear tested. Review manually if needed.")
        print("Test Advisor Agent: Suggested tests for the impacted modules ")
        print(suggestions)
        return suggestions
