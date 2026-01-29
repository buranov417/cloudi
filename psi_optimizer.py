import torch

class PsiOptimizer(torch.optim.Optimizer):
    def __init__(self, params, lr=1e-3, jump_factor=25):
        defaults = dict(lr=lr, jump_factor=jump_factor)
        super().__init__(params, defaults)

    def step(self):
        for group in self.param_groups:
            for p in group['params']:
                if p.grad is None: continue
                
                # Реализация 'Предиктивного прыжка'
                # Мы умножаем градиент на jump_factor, чтобы ускорить сходимость
                actual_step = p.grad * group['jump_factor']
                p.data.add_(-group['lr'], actual_step)
