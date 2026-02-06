from typing import List


class PipelineStep:
    def __init__(
        self,
        step_id: int,
        exec_time: float,
        cost: float,
        dependencies: List[int] | None = None
    ):
        self.step_id = step_id
        self.exec_time = exec_time
        self.cost = cost
        self.dependencies = dependencies or []

    def score(self) -> float:
        # чем выше — тем хуже шаг
        return self.exec_time * self.cost