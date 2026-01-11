import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface CreateCommentData {
  task_id: string;
  content: string;
}

export const useComments = (taskId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { measureOperation } = usePerformanceMonitor();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      return await measureOperation('comments', 'read', async () => {
        if (!taskId) return [];

        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles!comments_user_id_fkey(full_name, email)
          `)
          .eq('task_id', taskId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data.map(comment => ({
          ...comment,
          profiles: comment.profiles || { full_name: null, email: '' }
        })) as Comment[];
      });
    },
    enabled: !!taskId,
  });

  const createComment = useMutation({
    mutationFn: async (commentData: CreateCommentData) => {
      return await measureOperation('comments', 'create', async () => {
        if (!user?.id) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('comments')
          .insert({
            ...commentData,
            user_id: user.id,
          })
          .select(`
            *,
            profiles(full_name, email)
          `)
          .single();

        if (error) throw error;
        return data;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      toast({
        title: 'Sucesso',
        description: 'Comentário adicionado com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar comentário',
        variant: 'destructive',
      });
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      return await measureOperation('comments', 'delete', async () => {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);

        if (error) throw error;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
      toast({
        title: 'Sucesso',
        description: 'Comentário excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir comentário',
        variant: 'destructive',
      });
    },
  });

  return {
    comments,
    isLoading,
    createComment,
    deleteComment,
  };
};
