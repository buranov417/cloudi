import torch
import torch.nn as nn
from psi_gate import PsiGate
from psi_optimizer import PsiOptimizer

# Собираем модель по твоей логике
model = nn.Sequential(
    nn.Linear(100, 512),
    PsiGate(threshold=0.05), # Наш фильтр встроен в архитектуру
    nn.ReLU(),
    nn.Linear(512, 10),
    nn.LogSoftmax(dim=1)
)

# Используем наш кастомный оптимизатор
optimizer = PsiOptimizer(model.parameters(), lr=0.01, jump_factor=25)
criterion = nn.NLLLoss()

print("Система Psi-Opt инициализирована.")
print("Статус: Готовность к обучению на сверхвысоких скоростях.")
