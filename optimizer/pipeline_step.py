from dataclasses import dataclass, field
from typing import List

@dataclass
class PipelineStep:
    id: int
    exec_time: float        # ms
    cost: float             # $
    error_rate: float       # %
    stability: float        # 1.0 идеально
    complexity: float       # условная сложность
    dependencies: List[int] = field(default_factory=list)
    action_taken: str = None