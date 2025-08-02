# agents/risk_scorer_agent.py
class RiskScorerAgent:
    def __init__(self):
        pass

    def score_risk(self, impacted_modules):
        core_keywords = ["payment", "billing", "auth"]
        score = 1
        for module in impacted_modules:
            if any(keyword in module.lower() for keyword in core_keywords):
                score += 3
            else:
                score += 1
        score = min(score, 10)
        return {
            "score": score,
            "reason": f"Risk score {score}/10 due to changes in {len(impacted_modules)} modules"
        } 