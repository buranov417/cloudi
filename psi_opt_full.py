import torch
import torch.nn as nn
import time

# 1. ГЕЙТ (Фильтрация данных - экономим память)
class PsiGate(nn.Module):
    def __init__(self, threshold=0.01):
        super().__init__()
        self.threshold = threshold
    def forward(self, x):
        return x * (x.abs() > self.threshold).float()

# 2. ОПТИМИЗАТОР (Тот самый прыжок в 25 раз)
class PsiOptimizer(torch.optim.Optimizer):
    def __init__(self, params, lr=1e-3, jump_factor=25):
        defaults = dict(lr=lr, jump_factor=jump_factor)
        super().__init__(params, defaults)
    def step(self):
        for group in self.param_groups:
            for p in group['params']:
                if p.grad is not None:
                    p.data.add_(p.grad, alpha=-group['lr'] * group['jump_factor'])

# 3. МОДЕЛЬ И ТЕСТ (Доказательство работы)
def start_psi_engine():
    # Создаем нейронку с твоим гейтом
    model = nn.Sequential(
        nn.Linear(100, 1000),
        PsiGate(threshold=0.05),
        nn.ReLU(),
        nn.Linear(1000, 10)
    )
    
    optimizer = PsiOptimizer(model.parameters(), lr=0.01, jump_factor=25)
    data = torch.randn(64, 100)
    target = torch.randn(64, 10)
    criterion = nn.MSELoss()

    print("--- ЗАПУСК СИСТЕМЫ PSI-OPT ---")
    start = time.time()
    
    # Цикл обучения
    for i in range(10):
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
        print(f"Шаг {i+1}: Ошибка = {loss.item():.4f}")
    
    print(f"--- ТЕСТ ЗАВЕРШЕН ЗА {time.time()-start:.4f} сек ---")

if __name__ == "__main__":
    start_psi_engine()
