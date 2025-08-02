# main.py
from crewai import Agent, Task, Crew
from openai import OpenAI
from agents.github_content_fetcher import GitHubContentFetcher
from tools.context_builder import build_context_from_files
from agents.pr_parser_agent import PRParserAgent
from agents.dependency_analyzer_agent import DependencyAnalyzerAgent
from agents.test_advisor_agent import TestAdvisorAgent
from agents.risk_scorer_agent import RiskScorerAgent
import os

if __name__ == "__main__":
    GITHUB_PAT = os.getenv("GITHUB_PAT")
    if not GITHUB_PAT:
        raise Exception("GITHUB_PAT not set in environment variables.")

    owner = "SayaliTal"
    repo = "calorie-tracker"
    pr_number = 1  # Replace or accept via CLI

    # Step 1: Get changed files from PR
    pr_parser = PRParserAgent(GITHUB_PAT)
    changed_files = pr_parser.get_changed_files(owner, repo, pr_number)

    # Step 2: Fetch contents from GitHub
    content_fetcher = GitHubContentFetcher(GITHUB_PAT)
    file_dict = {}
    for file_path in changed_files:
        code = content_fetcher.fetch_file(owner, repo, file_path)
        if code:
            file_dict[file_path] = code

    # Step 3: Build context
    context = build_context_from_files(file_dict)

    # Instantiate your internal logic agents
    dep_analyzer = DependencyAnalyzerAgent(context)
    test_advisor = TestAdvisorAgent(context)
    risk_scorer = RiskScorerAgent()

    # Wrap them into CrewAI-compatible agents
    dep_agent = Agent(
        role="Dependency Analyzer",
        goal="Identify impacted modules based on changed files and import graph.",
        backstory="Expert in analyzing code structure and dependency flows.",
        tools=[],
        verbose=True,
        allow_delegation=False,
    )


    test_agent = Agent(
        role="Test Advisor",
        goal="Generate actual test code for missing test cases in impacted modules.",
        backstory="Expert in writing unit and integration tests. You provide complete, runnable test code that covers the functionality of the impacted modules. Write tests in the appropriate testing framework (pytest, unittest, etc.) based on the project structure.",
        tools=[],
        verbose=True,
        allow_delegation=False,
    )

    risk_agent = Agent(
        role="Risk Scorer",
        goal="Assess the risk associated with the pull request changes.",
        backstory="Understands software criticality and scoring heuristics.",
        tools=[],
        verbose=True,
        allow_delegation=False,
    )

    # Define tasks to be run by each agent
    analyze_task = Task(
        description=f"Analyze changed files to detect impacted modules.\nChanged files: {changed_files}",
        expected_output="List of impacted modules",
        agent=dep_agent,
    )

    test_task = Task(
        description=f"Generate complete test code for the impacted modules. Use the following file contents to understand what to test:\n{file_dict}\n\nWrite actual test functions with proper assertions, mocking, and test cases. Include both unit tests and integration tests where appropriate. Make sure to output the complete test code, not just descriptions.",
        expected_output="Complete test code files with test functions and assertions",
        agent=test_agent,
    )

    risk_task = Task(
        description="Generate a risk score (1–10) for the PR based on impacted modules.",
        expected_output="Risk score with explanation",
        agent=risk_agent,
    )

    # Create the crew and run execution
    crew = Crew(
        agents=[dep_agent, test_agent, risk_agent],
        tasks=[analyze_task, test_task, risk_task],
        verbose=True,
    )

    result = crew.kickoff()
    print("\n--- Final AI Output ---")
    print(result)
    
    # Extract Test Advisor output into separate variable
    result_str = str(result)
    test_advisor_output = ""
    
    # Parse the result to extract test-related content
    if "test" in result_str.lower() or "Test" in result_str:
        # Find test-related sections in the result
        lines = result_str.split('\n')
        test_sections = []
        in_test_section = False
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ['test', 'assert', 'def test_', 'class test']):
                in_test_section = True
                test_sections.append(line)
            elif in_test_section and line.strip() == '':
                in_test_section = False
            elif in_test_section:
                test_sections.append(line)
        
        if test_sections:
            test_advisor_output = '\n'.join(test_sections)
        else:
            test_advisor_output = "⚠️  No test code found in the output. The Test Advisor may need more specific instructions."
    else:
        test_advisor_output = "⚠️  No test-related content found in the crew output."
    
    # Print Test Advisor output separately
    print("\n" + "="*80)
    print("🧪 TEST ADVISOR OUTPUT")
    print("="*80)
    print(test_advisor_output)
    
    print("\n" + "="*80)
    print("✅ Task Completion Summary")
    print("="*80)
    print("✅ Dependency Analysis Task: Completed")
    print("✅ Test Generation Task: Completed") 
    print("✅ Risk Assessment Task: Completed")
