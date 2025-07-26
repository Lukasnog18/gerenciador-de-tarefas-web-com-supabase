
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { toast } from '@/hooks/use-toast';

export const useSampleData = () => {
  const { createProject } = useProjects();
  const { createTask } = useTasks();
  const { createTag } = useTags();

  const createSampleData = async () => {
    try {
      toast({
        title: 'Criando dados de exemplo...',
        description: 'Isso pode levar alguns segundos.',
      });

      // Create sample tags first
      const tagPromises = [
        { name: 'Frontend', color: '#3b82f6' },
        { name: 'Backend', color: '#ef4444' },
        { name: 'Design', color: '#8b5cf6' },
        { name: 'Mobile', color: '#10b981' },
        { name: 'API', color: '#f59e0b' },
        { name: 'Database', color: '#6b7280' },
        { name: 'Testing', color: '#ec4899' },
      ].map(tag => createTag.mutateAsync(tag));

      const createdTags = await Promise.all(tagPromises);

      // Create sample projects
      const projectsData = [
        {
          name: 'Sistema de E-commerce',
          description: 'Desenvolvimento completo de plataforma de vendas online com integração de pagamento e gestão de estoque.',
          status: 'active' as const,
          due_date: '2024-03-15',
        },
        {
          name: 'App Mobile de Delivery',
          description: 'Aplicativo mobile para pedidos de comida com rastreamento em tempo real e sistema de avaliações.',
          status: 'active' as const,
          due_date: '2024-02-28',
        },
        {
          name: 'Dashboard Administrativo',
          description: 'Interface web para gestão de usuários, relatórios e configurações do sistema.',
          status: 'active' as const,
          due_date: '2024-04-10',
        },
        {
          name: 'API de Integração',
          description: 'Desenvolvimento de API REST para integração com sistemas terceiros e webhooks.',
          status: 'on_hold' as const,
          due_date: '2024-05-20',
        },
      ];

      const projectPromises = projectsData.map(project => createProject.mutateAsync(project));
      const createdProjects = await Promise.all(projectPromises);

      // Create sample tasks for each status
      const tasksData = [
        // Pending tasks (5)
        {
          title: 'Configurar ambiente de desenvolvimento',
          description: 'Instalar e configurar todas as dependências necessárias para o projeto.',
          status: 'pending' as const,
          priority: 'high' as const,
          project_id: createdProjects[0].id,
          due_date: '2024-01-30',
          tag_ids: [createdTags[0].id, createdTags[1].id],
        },
        {
          title: 'Criar wireframes das telas principais',
          description: 'Desenvolver wireframes para homepage, produto e checkout.',
          status: 'pending' as const,
          priority: 'medium' as const,
          project_id: createdProjects[0].id,
          due_date: '2024-02-05',
          tag_ids: [createdTags[2].id],
        },
        {
          title: 'Definir arquitetura do banco de dados',
          description: 'Modelar as tabelas e relacionamentos necessários para o sistema.',
          status: 'pending' as const,
          priority: 'high' as const,
          project_id: createdProjects[1].id,
          due_date: '2024-02-02',
          tag_ids: [createdTags[5].id],
        },
        {
          title: 'Pesquisa de mercado para funcionalidades',
          description: 'Analisar concorrentes e identificar features essenciais.',
          status: 'pending' as const,
          priority: 'low' as const,
          project_id: createdProjects[1].id,
          tag_ids: [],
        },
        {
          title: 'Configurar CI/CD pipeline',
          description: 'Implementar pipeline de integração e deploy contínuo.',
          status: 'pending' as const,
          priority: 'medium' as const,
          project_id: createdProjects[2].id,
          due_date: '2024-02-10',
          tag_ids: [createdTags[1].id],
        },

        // In Progress tasks (5)
        {
          title: 'Implementar sistema de autenticação',
          description: 'Desenvolver login, registro e recuperação de senha.',
          status: 'in_progress' as const,
          priority: 'high' as const,
          project_id: createdProjects[0].id,
          due_date: '2024-02-15',
          tag_ids: [createdTags[0].id, createdTags[1].id],
        },
        {
          title: 'Desenvolver carrinho de compras',
          description: 'Funcionalidade completa de adicionar/remover produtos.',
          status: 'in_progress' as const,
          priority: 'high' as const,
          project_id: createdProjects[0].id,
          due_date: '2024-02-20',
          tag_ids: [createdTags[0].id],
        },
        {
          title: 'Criar telas do aplicativo mobile',
          description: 'Desenvolvimento das interfaces principais em React Native.',
          status: 'in_progress' as const,
          priority: 'medium' as const,
          project_id: createdProjects[1].id,
          due_date: '2024-02-25',
          tag_ids: [createdTags[3].id, createdTags[2].id],
        },
        {
          title: 'Integração com gateway de pagamento',
          description: 'Implementar Stripe e PayPal no sistema.',
          status: 'in_progress' as const,
          priority: 'high' as const,
          project_id: createdProjects[0].id,
          due_date: '2024-02-18',
          tag_ids: [createdTags[1].id, createdTags[4].id],
        },
        {
          title: 'Desenvolver dashboard de métricas',
          description: 'Telas com gráficos e relatórios para administradores.',
          status: 'in_progress' as const,
          priority: 'medium' as const,
          project_id: createdProjects[2].id,
          due_date: '2024-03-01',
          tag_ids: [createdTags[0].id],
        },

        // Completed tasks (5)
        {
          title: 'Análise de requisitos do projeto',
          description: 'Documentação completa dos requisitos funcionais e não-funcionais.',
          status: 'completed' as const,
          priority: 'high' as const,
          project_id: createdProjects[0].id,
          tag_ids: [],
        },
        {
          title: 'Setup inicial do projeto React',
          description: 'Configuração do ambiente React com TypeScript e Tailwind.',
          status: 'completed' as const,
          priority: 'high' as const,
          project_id: createdProjects[0].id,
          tag_ids: [createdTags[0].id],
        },
        {
          title: 'Design system e componentes básicos',
          description: 'Criação dos componentes reutilizáveis e tokens de design.',
          status: 'completed' as const,
          priority: 'medium' as const,
          project_id: createdProjects[2].id,
          tag_ids: [createdTags[2].id, createdTags[0].id],
        },
        {
          title: 'Configuração do banco de dados',
          description: 'Setup do PostgreSQL e migração inicial.',
          status: 'completed' as const,
          priority: 'high' as const,
          project_id: createdProjects[1].id,
          tag_ids: [createdTags[5].id],
        },
        {
          title: 'Testes unitários dos componentes',
          description: 'Implementação de testes para os componentes principais.',
          status: 'completed' as const,
          priority: 'low' as const,
          project_id: createdProjects[2].id,
          tag_ids: [createdTags[6].id, createdTags[0].id],
        },
      ];

      // Create tasks in batches to avoid overwhelming the API
      for (let i = 0; i < tasksData.length; i += 3) {
        const batch = tasksData.slice(i, i + 3);
        const batchPromises = batch.map(task => createTask.mutateAsync(task));
        await Promise.all(batchPromises);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: 'Sucesso!',
        description: 'Dados de exemplo criados com sucesso!',
      });

    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar dados de exemplo.',
        variant: 'destructive',
      });
    }
  };

  return {
    createSampleData,
    isLoading: createProject.isPending || createTask.isPending || createTag.isPending,
  };
};
