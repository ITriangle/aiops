"""Tests for scripts/lib/router.py — canonical Flow Conductor routes."""

import unittest

from scripts.lib.router import (
    FlowState,
    advance_journey,
    initial_journey,
    narration_progress,
    plan_flow,
)


class PlanFlowTests(unittest.TestCase):
    def test_feature_single_session_has_design_review_before_delivery(self):
        state = FlowState(
            task_kind="feature_idea",
            issue_tracker_configured=True,
            delivery_mode="single_session",
        )
        plan = plan_flow(state)
        ids = [p.phase_id for p in plan.phases]
        self.assertIn("alignment", ids)
        self.assertIn("design_review", ids)
        self.assertIn("delivery", ids)
        self.assertLess(ids.index("design_review"), ids.index("delivery"))
        self.assertNotIn("planning_prd", ids)

    def test_feature_multi_session_inserts_planning(self):
        state = FlowState(
            task_kind="feature_idea",
            issue_tracker_configured=True,
            delivery_mode="multi_session",
        )
        plan = plan_flow(state)
        ids = [p.phase_id for p in plan.phases]
        self.assertIn("planning_prd", ids)
        self.assertIn("planning_issues", ids)
        self.assertLess(ids.index("planning_issues"), ids.index("delivery"))

    def test_feature_with_ui_has_mockup_before_design_review(self):
        state = FlowState(task_kind="feature_with_ui", issue_tracker_configured=True)
        plan = plan_flow(state)
        ids = [p.phase_id for p in plan.phases]
        self.assertIn("ui_mockup", ids)
        self.assertLess(ids.index("ui_mockup"), ids.index("design_review"))

    def test_bug_skips_alignment(self):
        plan = plan_flow(FlowState(task_kind="bug_fix"))
        ids = [p.phase_id for p in plan.phases]
        self.assertEqual(ids[0], "diagnose")
        self.assertNotIn("alignment", ids)

    def test_architecture_health_starts_with_scan(self):
        state = FlowState(task_kind="architecture_health", issue_tracker_configured=True)
        plan = plan_flow(state)
        ids = [p.phase_id for p in plan.phases]
        self.assertEqual(ids[0], "architecture_scan")
        self.assertIn("improve-codebase-architecture", plan.phases[0].skill)

    def test_unconfigured_prepends_bootstrap(self):
        plan = plan_flow(FlowState(task_kind="feature_idea"))
        self.assertEqual(plan.phases[0].phase_id, "bootstrap")

    def test_greenfield_uses_grilling(self):
        state = FlowState(task_kind="feature_idea", has_codebase=False, issue_tracker_configured=True)
        plan = plan_flow(state)
        align = next(p for p in plan.phases if p.phase_id == "alignment")
        self.assertEqual(align.skill, "/grilling")

    def test_each_phase_has_skill_agent_narration(self):
        plan = plan_flow(FlowState(task_kind="feature_idea", issue_tracker_configured=True))
        for phase in plan.phases:
            self.assertTrue(phase.phase_id)
            self.assertTrue(phase.narration_key)
            self.assertTrue(phase.skill or phase.agent)


class JourneyTests(unittest.TestCase):
    def test_initial_journey_starts_at_first_phase(self):
        state = FlowState(task_kind="bug_fix")
        plan = plan_flow(state)
        journey = initial_journey(state, "login-fix", "fix login 500")
        self.assertEqual(journey.current_phase_id, plan.phases[0].phase_id)
        self.assertEqual(journey.slug, "login-fix")

    def test_advance_journey_moves_forward(self):
        state = FlowState(task_kind="bug_fix")
        plan = plan_flow(state)
        journey = initial_journey(state, "x", "y")
        journey = advance_journey(journey, plan)
        self.assertEqual(journey.current_phase_id, plan.phases[1].phase_id)
        self.assertIn(plan.phases[0].phase_id, journey.phases_done)

    def test_narration_progress(self):
        state = FlowState(task_kind="bug_fix")
        plan = plan_flow(state)
        journey = initial_journey(state, "x", "y")
        step, total = narration_progress(journey, plan)
        self.assertEqual(step, 1)
        self.assertEqual(total, len(plan.phases))


if __name__ == "__main__":
    unittest.main()
