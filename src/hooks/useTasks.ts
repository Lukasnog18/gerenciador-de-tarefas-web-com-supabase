import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: string;
  user_id: string;
  created_at: string;
  projects: {
    name: string;
  };
  task_tags: {
    tags: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}

interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id: string;
  tag_ids?: string[];
}

export const useTasks = (filters?: {
  status?: string;
  project_id?: string;
  search?: string;
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { measureOperation } = usePerformanceMonitor();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', user?.id, filters],
    queryFn: async () => {
      return await measureOperation('tasks', 'read', async () => {
        if (!user?.id) return [];

        let query = supabase
          .from('tasks')
          .select(`
            *,
            projects!inner(name),
            task_tags(
              tags(id, name, color)
            )
          `)
          .eq('user_id', user.id);

        if (filters?.status && filters.status !== 'all') {
          const statusValue = filters.status as 'pending' | 'in_progress' | 'completed';
          query = query.eq('status', statusValue);
        }

        if (filters?.project_id && filters.project_id !== 'all') {
          query = query.eq('project_id', filters.project_id);
        }

        if (filters?.search) {
          query = query.ilike('title', `%${filters.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data as Task[];
      });
    },
    enabled: !!user?.id,
  });

  const createTask = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      return await measureOperation('tasks', 'create', async () => {
        if (!user?.id) throw new Error('User not authenticated');

        const { tag_ids, ...taskFields } = taskData;

        const { data: task, error: taskError } = await supabase
          .from('tasks')
          .insert({
            ...taskFields,
            user_id: user.id,
          })
          .select()
          .single();

        if (taskError) throw taskError;

        if (tag_ids && tag_ids.length > 0) {
          const { error: tagError } = await supabase
            .from('task_tags')
            .insert(
              tag_ids.map(tag_id => ({
                task_id: task.id,
                tag_id,
              }))
            );

          if (tagError) throw tagError;
        }

        return task;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar tarefa',
        variant: 'destructive',
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, tag_ids, ...updateData }: Partial<CreateTaskData> & { id: string }) => {
      return await measureOperation('tasks', 'update', async () => {
        const { error: taskError } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id);

        if (taskError) throw taskError;

        if (tag_ids !== undefined) {
          await supabase.from('task_tags').delete().eq('task_id', id);

          if (tag_ids.length > 0) {
            const { error: tagError } = await supabase
              .from('task_tags')
              .insert(
                tag_ids.map(tag_id => ({
                  task_id: id,
                  tag_id,
                }))
              );

            if (tagError) throw tagError;
          }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar tarefa',
        variant: 'destructive',
      });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      return await measureOperation('tasks', 'delete', async () => {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Sucesso',
        description: 'Tarefa excluída com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir tarefa',
        variant: 'destructive',
      });
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  };
};
