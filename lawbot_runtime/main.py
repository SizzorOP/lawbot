"""Entry point for the LawBOT runtime.

This script provides a simple command‑line interface for running
individual skills through the specialised agents defined in the
``lawbot`` directory.  It is not a full replacement for the OpenClaw
gateway but demonstrates how one might structure a controller that
loads agents, routes requests and invokes the appropriate tools.

Usage:
    python main.py <agent> <skill> [options]

Agents:
    research_agent   Perform legal research or summarisation tasks.
    drafting_agent   Generate drafts based on templates and variables.
    case_agent       Manage case timelines and meeting intelligence.

Skills and required options:
    legal-research    --query "Search query"
    summarize_case    --file <path to text file>
    drafting          --template <path to template file> --vars '{"key": "value", ...}'
    citation_checker  --citations "citation1; citation2; ..."

Example:
    python main.py research_agent legal-research --query "habeas corpus" 

This code is intentionally minimal and synchronous.  A production
orchestrator could implement asynchronous calls, message routing and
context assembly according to the OpenClaw architecture.
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, Any, List

try:
    from dotenv import load_dotenv

    load_dotenv()  # loads .env if present
except Exception:
    # dotenv is optional; environment variables may be set by the shell.
    pass

from agent import Agent  # local module
from tools import (
    legal_search,
    summarize_doc,
    citation_checker,
    document_fill,
    transcribe_audio,
    case_status,
)


def load_text_file(path: str) -> str:
    """Read a text file and return its contents.

    Raises FileNotFoundError if the file does not exist.
    """
    p = Path(path)
    with p.open("r", encoding="utf-8") as f:
        return f.read()


def main(argv: List[str]) -> int:
    parser = argparse.ArgumentParser(description="Run a LawBOT skill via a specified agent")
    parser.add_argument("agent", choices=["research_agent", "drafting_agent", "case_agent"], help="Which agent to use")
    parser.add_argument("skill", help="Skill name (e.g. legal-research, summarize_case, drafting, citation_checker)")
    parser.add_argument("--query", dest="query", help="Search query for legal research")
    parser.add_argument("--file", dest="file", help="Path to text file for summarisation")
    parser.add_argument("--template", dest="template", help="Path to template file for drafting")
    parser.add_argument("--vars", dest="vars", help="JSON string of variables for template filling")
    parser.add_argument("--citations", dest="citations", help="Semicolon separated list of citations to check")
    args = parser.parse_args(argv)

    # Construct the tools dictionary mapping tool names to functions
    tools: Dict[str, Any] = {
        "legal_search": legal_search,
        "summarize_doc": summarize_doc,
        "citation_checker": citation_checker,
        "document_fill": document_fill,
        "transcribe_audio": transcribe_audio,
        "case_status": case_status,
    }

    # Determine the workspace directory for the selected agent
    workspace_root = Path(__file__).resolve().parent.parent / "lawbot"
    workspace_dir = workspace_root / args.agent
    if not workspace_dir.exists():
        print(f"Workspace for agent {args.agent} does not exist at {workspace_dir}", file=sys.stderr)
        return 1
    # Instantiate the agent
    agent = Agent(str(workspace_dir), tools)

    # Dispatch based on skill
    skill = args.skill
    if skill == "legal-research":
        if not args.query:
            print("--query is required for legal-research", file=sys.stderr)
            return 1
        result = agent.execute_skill("legal-research", query=args.query)
        print(json.dumps(result, indent=2))
        return 0
    elif skill == "summarize_case":
        if not args.file:
            print("--file is required for summarize_case", file=sys.stderr)
            return 1
        try:
            text = load_text_file(args.file)
        except FileNotFoundError:
            print(f"File {args.file} not found", file=sys.stderr)
            return 1
        result = agent.execute_skill("summarize_case", text=text)
        print(json.dumps(result, indent=2))
        return 0
    elif skill == "drafting":
        if not args.template:
            print("--template is required for drafting", file=sys.stderr)
            return 1
        try:
            template_text = load_text_file(args.template)
        except FileNotFoundError:
            print(f"Template file {args.template} not found", file=sys.stderr)
            return 1
        variables: Dict[str, Any] = {}
        if args.vars:
            try:
                variables = json.loads(args.vars)
            except json.JSONDecodeError:
                print("--vars must be valid JSON", file=sys.stderr)
                return 1
        result = agent.execute_skill("drafting", template=template_text, variables=variables)
        print(result)
        return 0
    elif skill == "citation_checker":
        if not args.citations:
            print("--citations is required for citation_checker", file=sys.stderr)
            return 1
        citations_list = [c.strip() for c in args.citations.split(";") if c.strip()]
        result = agent.execute_skill("citation_checker", citations=citations_list)
        print(json.dumps(result, indent=2))
        return 0
    else:
        print(f"Unknown skill: {skill}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))