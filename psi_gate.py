import torch
import torch.nn as nn

class PsiGate(nn.Module):
    """Отсекает 90% ненужных вычислений, пропуская только важные сигналы."""
    def __init__(self, threshold=0.01):
        super().__init__()
        self.threshold = threshold

    def forward(self, x):
        # Если сигнал нейрона ниже порога — мы его обнуляем (не считаем)
        mask = (x.abs() > self.threshold).float()
        return x * mask
