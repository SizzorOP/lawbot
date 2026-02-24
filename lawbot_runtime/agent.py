import json
from pathlib import Path
from typing import Dict, Any


class Agent:
    """
    A minimal representation of an OpenClaw-like agent.  Each agent has its
    own workspace, memory and skills.  This class is responsible for
    loading the agent configuration and executing skills via tools.
    """

    def __init__(self, workspace_dir: str, tools: Dict[str, Any]):
        self.workspace = Path(workspace_dir)
        self.tools = tools
        self.load_user_profile()
        self.load_skills()

    def load_user_profile(self) -> None:
        """Load the USER.md file to set jurisdiction and practice areas."""
        user_file = self.workspace / "USER.md"
        self.user_profile: Dict[str, str] = {}
        if user_file.exists():
            with user_file.open("r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines:
                if line.startswith("**Name:**"):
                    self.user_profile["name"] = line.split("**Name:**")[-1].strip()
                elif line.startswith("**Jurisdiction:**"):
                    self.user_profile["jurisdiction"] = line.split("**Jurisdiction:**")[-1].strip()
                elif line.startswith("**Practice Areas:**"):
                    self.user_profile["practice_areas"] = line.split("**Practice Areas:**")[-1].strip()
                elif line.startswith("**Timezone:**"):
                    self.user_profile["timezone"] = line.split("**Timezone:**")[-1].strip()

    def load_skills(self) -> None:
        """Discover skills available to this agent from its skills folder."""
        skills_dir = self.workspace / "skills"
        self.skills: Dict[str, Dict[str, Any]] = {}
        if skills_dir.exists():
            for skill_dir in skills_dir.iterdir():
                skill_file = skill_dir / "SKILL.md"
                if skill_file.exists():
                    with skill_file.open("r", encoding="utf-8") as f:
                        content = f.read()
                    # parse YAML front matter for name and description
                    # naive parsing: front matter starts after --- and ends before next ---
                    parts = content.split('---')
                    if len(parts) >= 3:
                        # second part is YAML front matter
                        yaml_part = parts[1]
                        skill_name = None
                        for line in yaml_part.splitlines():
                            if line.strip().startswith("name:"):
                                skill_name = line.split(":", 1)[1].strip()
                                break
                        if skill_name:
                            self.skills[skill_name] = {
                                "path": skill_dir,
                                "instructions": content
                            }

    def execute_skill(self, skill_name: str, **kwargs) -> Any:
        """Execute a skill by invoking the corresponding tool(s)."""
        # This method dispatches to appropriate tool based on skill.
        if skill_name == "legal-research":
            query = kwargs.get("query")
            return self.tools["legal_search"](query)
        elif skill_name == "summarize_case":
            text = kwargs.get("text")
            return self.tools["summarize_doc"](text)
        elif skill_name == "drafting":
            # simple placeholder: return a template filled text
            template = kwargs.get("template", "")
            variables = kwargs.get("variables", {})
            return self.tools["document_fill"](template, variables)
        elif skill_name == "citation_checker":
            citations = kwargs.get("citations", [])
            return self.tools["citation_checker"](citations)
        else:
            return {"error": f"Skill {skill_name} not implemented"}