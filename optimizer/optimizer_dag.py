from typing import List
from optimizer.pipeline_step import PipelineStep


class MillenniumOptimizerDAG:
    def __init__(self, aggressiveness: float = 0.6):
        self.aggressiveness = aggressiveness

    def optimize(self, pipeline: List[PipelineStep]) -> List[PipelineStep]:
        if not pipeline:
            return []

        scored = [(step, step.score()) for step in pipeline]
        scored.sort(key=lambda x: x[1], reverse=True)

        removable = int(len(scored) * self.aggressiveness)
        removed_ids = set(step.step_id for step, _ in scored[:removable])

        optimized = []
        for step, _ in scored:
            if step.step_id in removed_ids:
                # нельзя удалять если есть зависимости
                if any(step.step_id in s.dependencies for s, _ in scored):
                    optimized.append(step)
                else:
                    continue
            else:
                optimized.append(step)

        return optimized