"""CLI for maintainer / agent: print canonical flow plan from FlowState flags."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow `python3 scripts/lib/flow_cli.py` without package install
sys.path.insert(0, str(Path(__file__).resolve().parent))

from router import FlowPhase, FlowState, JourneyState, initial_journey, plan_flow  # noqa: E402


def _state_from_args(args: argparse.Namespace) -> FlowState:
    task = args.task_kind
    if args.ui:
        task = "feature_with_ui"
    return FlowState(
        task_kind=task,
        has_codebase=not args.greenfield,
        issue_tracker_configured=args.configured,
        needs_runnable_answer=args.prototype,
        delivery_mode="multi_session" if args.multi else "single_session",
        triage_unclear=args.triage_unclear,
    )


def _phase_to_dict(phase: FlowPhase) -> dict:
    return {
        "phase_id": phase.phase_id,
        "skill": phase.skill,
        "agent": phase.agent,
        "narration_key": phase.narration_key,
        "reason": phase.reason,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Print aiops Flow Conductor plan")
    parser.add_argument(
        "--task-kind",
        dest="task_kind",
        default="feature_idea",
        choices=[
            "feature_idea",
            "feature_with_ui",
            "bug_fix",
            "incoming_queue",
            "architecture_health",
            "new_personal_skill",
            "prototype",
        ],
    )
    parser.add_argument("--greenfield", action="store_true", help="No existing codebase (grilling)")
    parser.add_argument("--configured", action="store_true", help="Issue tracker already configured")
    parser.add_argument("--multi", action="store_true", help="Multi-session delivery")
    parser.add_argument("--prototype", action="store_true", help="Needs runnable prototype branch")
    parser.add_argument("--ui", action="store_true", help="Feature with UI mockups")
    parser.add_argument("--triage-unclear", action="store_true", help="Incoming item needs grill")
    parser.add_argument("--slug", default="my-feature", help="Feature slug for journey preview")
    parser.add_argument("--description", default="", help="User task description")
    args = parser.parse_args()

    state = _state_from_args(args)
    plan = plan_flow(state)
    journey = initial_journey(state, args.slug, args.description)

    out = {
        "state": {
            "task_kind": state.task_kind,
            "has_codebase": state.has_codebase,
            "issue_tracker_configured": state.issue_tracker_configured,
            "needs_runnable_answer": state.needs_runnable_answer,
            "delivery_mode": state.delivery_mode,
            "triage_unclear": state.triage_unclear,
        },
        "phases": [_phase_to_dict(p) for p in plan.phases],
        "overlays": list(plan.overlays),
        "questions": list(plan.questions),
        "journey": {
            "version": journey.version,
            "slug": journey.slug,
            "task_kind": journey.task_kind,
            "delivery_mode": journey.delivery_mode,
            "user_description": journey.user_description,
            "current_phase_id": journey.current_phase_id,
            "phases_done": journey.phases_done,
            "gates_satisfied": journey.gates_satisfied,
            "current_issue": journey.current_issue,
            "delivery_sub_phase": journey.delivery_sub_phase,
        },
    }
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
