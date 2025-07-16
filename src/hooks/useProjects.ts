import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface Project {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  created_at: string;
  user_id: string;
  task_count?: number;
}

interface CreateProjectData {
  name: string;
  description?: string;
  due_date?: string;
  status?: 'active' | 'completed' | 'on_hold' | 'cancelled';
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { measureOperation } = usePerformanceMonitor();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      return await measureOperation('projects', 'read', async () => {
        if (!user?.id) return [];

        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            tasks!tasks_project_id_fkey(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(project => ({
          ...project,
          task_count: project.tasks?.[0]?.count || 0
        })) as Project[];
      });
    },
    enabled: !!user?.id,
  });

  const createProject = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      return await measureOperation('projects', 'create', async () => {
        if (!user?.id) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Sucesso',
        description: 'Projeto criado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar projeto',
        variant: 'destructive',
      });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Project> & { id: string }) => {
      return await measureOperation('projects', 'update', async () => {
        const { data, error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Sucesso',
        description: 'Projeto atualizado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar projeto',
        variant: 'destructive',
      });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      return await measureOperation('projects', 'delete', async () => {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) throw error;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: 'Sucesso',
        description: 'Projeto excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir projeto',
        variant: 'destructive',
      });
    },
  });

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
  };
};
