
-- Inserir projetos para o usuário existente
INSERT INTO projects (user_id, name, description, status, due_date) VALUES
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'Website Redesign', 'Redesenhar o site corporativo com nova identidade visual', 'active', '2026-02-15'),
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'App Mobile', 'Desenvolvimento do aplicativo móvel para clientes', 'active', '2026-03-01'),
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'Sistema de Relatórios', 'Dashboard de análise de dados e métricas', 'completed', '2026-01-10');

-- Inserir tarefas para os projetos
INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date)
SELECT 
  'd20f12b9-2017-43a5-9604-585e6db4bd9d',
  p.id,
  t.title,
  t.description,
  t.status::task_status,
  t.priority::task_priority,
  t.due_date::date
FROM projects p
CROSS JOIN (VALUES
  ('Website Redesign', 'Criar wireframes', 'Desenhar wireframes das páginas principais', 'completed', 'high', '2026-01-20'),
  ('Website Redesign', 'Design UI', 'Criar design visual no Figma', 'in_progress', 'high', '2026-01-25'),
  ('Website Redesign', 'Implementar frontend', 'Desenvolver componentes React', 'pending', 'medium', '2026-02-10'),
  ('App Mobile', 'Definir requisitos', 'Levantar requisitos com stakeholders', 'completed', 'high', '2026-01-15'),
  ('App Mobile', 'Protótipo navegável', 'Criar protótipo interativo', 'in_progress', 'medium', '2026-02-01'),
  ('App Mobile', 'Desenvolvimento iOS', 'Implementar versão iOS', 'pending', 'high', '2026-02-20'),
  ('Sistema de Relatórios', 'Modelar dados', 'Definir estrutura do banco de dados', 'completed', 'high', '2026-01-05'),
  ('Sistema de Relatórios', 'Criar gráficos', 'Implementar visualizações com Recharts', 'completed', 'medium', '2026-01-08')
) AS t(project_name, title, description, status, priority, due_date)
WHERE p.name = t.project_name AND p.user_id = 'd20f12b9-2017-43a5-9604-585e6db4bd9d';

-- Inserir algumas tags
INSERT INTO tags (user_id, name, color) VALUES
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'Urgente', '#ef4444'),
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'Frontend', '#3b82f6'),
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'Backend', '#10b981'),
  ('d20f12b9-2017-43a5-9604-585e6db4bd9d', 'Design', '#8b5cf6');
