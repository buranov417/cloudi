import math
from typing import List
from .pipeline_step import PipelineStep

class MillenniumOptimizerDAG:
    def __init__(self):
        self.logs = []

    def score(self, step: PipelineStep):
        instability_penalty = max(0, step.stability - 1.05) * 4
        inefficiency = step.exec_time * step.cost
        complexity_penalty = math.log(step.complexity + 1)
        dependency_weight = len(step.dependencies) * 5
        return inefficiency + complexity_penalty + instability_penalty - dependency_weight

    def optimize(self, pipeline: List[PipelineStep]):
        scored = [(step, self.score(step)) for step in pipeline]
        scored.sort(key=lambda x: x[1], reverse=True)

        removed = []
        kept = []

        dependency_map = {}
        for step in pipeline:
            for dep in step.dependencies:
                dependency_map.setdefault(dep, []).append(step.id)

        for step, score in scored:
            if step.id in dependency_map and dependency_map[step.id]:
                step.action_taken = "kept"
                kept.append(step)
            else:
                if len(removed) < int(len(pipeline) * 0.6):
                    step.action_taken = "removed"
                    removed.append(step)
                else:
                    step.action_taken = "kept"
                    kept.append(step)

            self.logs.append({
                "step": step.id,
                "action": step.action_taken,
                "score": round(score,2)
            })

        return kept