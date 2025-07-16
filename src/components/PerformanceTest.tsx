
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { useComments } from '@/hooks/useComments';
import { Play, BarChart3, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const PerformanceTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const { measureOperation, generateReport, clearMetrics } = usePerformanceMonitor();
  
  const { createProject, updateProject, deleteProject } = useProjects();
  const { createTask, updateTask, deleteTask } = useTasks();
  const { createTag, updateTag, deleteTag } = useTags();
  const { createComment, deleteComment } = useComments();

  const runAutomaticTest = async () => {
    setIsRunning(true);
    console.log('%c🚀 INICIANDO TESTE DE PERFORMANCE AUTOMÁTICO', 'color: #2563eb; font-size: 18px; font-weight: bold;');
    
    try {
      const iterations = 5;
      
      // Teste de Projetos
      console.log('%c--- TESTANDO PROJETOS ---', 'color: #1f2937; font-size: 14px; font-weight: bold;');
      for (let i = 0; i < iterations; i++) {
        const projectData = {
          name: `Projeto Teste ${i + 1}`,
          description: `Descrição do projeto de teste ${i + 1}`,
          status: 'active' as const
        };

        // CREATE
        const project = await measureOperation('projects', 'create', () => 
          createProject.mutateAsync(projectData)
        );

        // UPDATE
        await measureOperation('projects', 'update', () => 
          updateProject.mutateAsync({ 
            id: project.id, 
            name: `${projectData.name} - Atualizado` 
          })
        );

        // DELETE
        await measureOperation('projects', 'delete', () => 
          deleteProject.mutateAsync(project.id)
        );

        // Pequena pausa entre iterações
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Teste de Tags
      console.log('%c--- TESTANDO TAGS ---', 'color: #1f2937; font-size: 14px; font-weight: bold;');
      for (let i = 0; i < iterations; i++) {
        const tagData = {
          name: `Tag Teste ${i + 1}`,
          color: '#3b82f6'
        };

        // CREATE
        const tag = await measureOperation('tags', 'create', () => 
          createTag.mutateAsync(tagData)
        );

        // UPDATE
        await measureOperation('tags', 'update', () => 
          updateTag.mutateAsync({ 
            id: tag.id, 
            name: `${tagData.name} - Atualizada` 
          })
        );

        // DELETE
        await measureOperation('tags', 'delete', () => 
          deleteTag.mutateAsync(tag.id)
        );

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Para testar tarefas e comentários, precisamos de um projeto real
      const testProject = await createProject.mutateAsync({
        name: 'Projeto para Teste de Performance',
        description: 'Projeto temporário para testes',
        status: 'active'
      });

      // Teste de Tarefas
      console.log('%c--- TESTANDO TAREFAS ---', 'color: #1f2937; font-size: 14px; font-weight: bold;');
      const taskIds: string[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const taskData = {
          title: `Tarefa Teste ${i + 1}`,
          description: `Descrição da tarefa de teste ${i + 1}`,
          project_id: testProject.id,
          status: 'pending' as const,
          priority: 'medium' as const
        };

        // CREATE
        const task = await measureOperation('tasks', 'create', () => 
          createTask.mutateAsync(taskData)
        );
        taskIds.push(task.id);

        // UPDATE
        await measureOperation('tasks', 'update', () => 
          updateTask.mutateAsync({ 
            id: task.id, 
            title: `${taskData.title} - Atualizada` 
          })
        );

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Teste de Comentários
      console.log('%c--- TESTANDO COMENTÁRIOS ---', 'color: #1f2937; font-size: 14px; font-weight: bold;');
      for (let i = 0; i < Math.min(iterations, taskIds.length); i++) {
        const commentData = {
          task_id: taskIds[i],
          content: `Comentário de teste ${i + 1}`
        };

        // CREATE
        const comment = await measureOperation('comments', 'create', () => 
          createComment.mutateAsync(commentData)
        );

        // DELETE
        await measureOperation('comments', 'delete', () => 
          deleteComment.mutateAsync(comment.id)
        );

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // DELETE das tarefas de teste
      for (const taskId of taskIds) {
        await measureOperation('tasks', 'delete', () => 
          deleteTask.mutateAsync(taskId)
        );
      }

      // DELETE do projeto de teste
      await deleteProject.mutateAsync(testProject.id);

      // Gerar relatório final
      setTimeout(() => {
        generateReport();
      }, 500);

      toast({
        title: 'Sucesso',
        description: 'Teste de performance concluído! Verifique o console para os resultados.',
      });

    } catch (error) {
      console.error('Erro durante o teste de performance:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro durante o teste de performance.',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Teste de Performance CRUD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Execute testes automáticos de performance para todas as operações CRUD. 
          Os resultados serão exibidos no console do navegador.
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={runAutomaticTest}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Executando...' : 'Executar Teste Automático'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={generateReport}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Gerar Relatório
          </Button>
          
          <Button 
            variant="outline"
            onClick={clearMetrics}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpar Métricas
          </Button>
        </div>

        <div className="bg-muted p-3 rounded-md text-sm">
          <strong>Como usar:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Clique em "Executar Teste Automático" para testar todas as operações</li>
            <li>• Abra o Console do navegador (F12) para ver os resultados detalhados</li>
            <li>• Cada operação será testada 5 vezes para obter médias confiáveis</li>
            <li>• O relatório final mostra médias, mínimos e máximos por operação</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
