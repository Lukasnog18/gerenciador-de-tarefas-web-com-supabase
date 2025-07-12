
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectModal } from "@/components/ProjectModal";
import { 
  Plus, 
  Search, 
  Calendar, 
  FolderOpen,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Pause,
  X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Projects() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const { projects, isLoading, deleteProject } = useProjects();
  const { tasks } = useTasks();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(search.toLowerCase()))
  );

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId).length;
  };

  const getProjectCompletedTaskCount = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId && task.status === 'completed').length;
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject.mutateAsync(projectId);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'on_hold': return 'Em Pausa';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'on_hold': return <Pause className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">
            Organize suas tarefas em projetos para melhor gestão
          </p>
        </div>
        
        <Button onClick={() => {
          setSelectedProject(null);
          setModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {search 
                  ? 'Nenhum projeto encontrado com o termo pesquisado.'
                  : 'Nenhum projeto encontrado. Crie seu primeiro projeto!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => {
            const taskCount = getProjectTaskCount(project.id);
            const completedCount = getProjectCompletedTaskCount(project.id);
            const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;

            return (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2 line-clamp-3">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o projeto "{project.name}"? 
                              Todas as tarefas associadas também serão excluídas. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{getStatusText(project.status)}</span>
                    </Badge>
                  </div>

                  {project.due_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Prazo: {format(new Date(project.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {new Date(project.due_date) < new Date() && project.status !== 'completed' && (
                        <Badge variant="destructive" className="ml-2">
                          Vencido
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Progresso das Tarefas</span>
                      <span className="font-medium">
                        {completedCount}/{taskCount} ({Math.round(progress)}%)
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Criado em {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </div>
  );
}
