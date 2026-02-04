# optimizer/optimizer_dag.py

import math
import time
from optimizer.pipeline_step import PipelineStep, repair_step, affects_others

class MillenniumOptimizerDAG:
    """
    DAG-оптимизатор с time-sliced обработкой.
    max_time_sec: максимальное время обработки одного батча шагов
    delta, penalty_limit: параметры для вычисления contextual_score
    """
    def __init__(self, max_time_sec=9.9, delta=0.05, penalty_limit=1.2):
        self.logs = []
        self.progress = 0
        self.max_time_sec = max_time_sec
        self.delta = delta
        self.penalty_limit = penalty_limit

    def contextual_score(self, step: PipelineStep) -> float:
        """Вычисление штрафа/уровня мусора шага"""
        garbage_score = math.log(1 + step.complexity_growth) / math.sqrt(step.error_drop)
        unstable_score = max(0, step.stability - (1 + self.delta)) * 5
        convergence_penalty = max(0, step.convergence - 1)
        return garbage_score + unstable_score + convergence_penalty

    def optimize_batch(self, dag_steps):
        """
        Обрабатываем DAG максимум max_time_sec секунд.
        Возвращаем оптимизированные шаги и прогресс.
        """
        start_time = time.time()
        optimized_steps = []

        for i in range(self.progress, len(dag_steps)):
            step = dag_steps[i]
            score = self.contextual_score(step)

            if score < self.penalty_limit:
                step.action_taken = "kept"
            else:
                if affects_others(step):
                    step = repair_step(step)
                else:
                    step.action_taken = "deleted"

            self.logs.append({
                "step": step.idx,
                "action": step.action_taken,
                "score": round(score, 3),
                "repaired": step.repair_log
            })

            optimized_steps.append(step)
            self.progress = i + 1

            # Таймер: останавливаем обработку, если превысили max_time_sec
            if time.time() - start_time > self.max_time_sec:
                break

        return optimized_steps, self.progress

    def optimize(self, dag_steps):
        """
        Полная оптимизация DAG, батчами по max_time_sec
        """
        all_optimized = []
        while self.progress < len(dag_steps):
            batch, _ = self.optimize_batch(dag_steps)
            all_optimized.extend(batch)
        return all_optimized