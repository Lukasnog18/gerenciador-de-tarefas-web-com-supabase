
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskModal } from "@/components/TaskModal";
import { TaskCommentsModal } from "@/components/TaskCommentsModal";
import { 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit,
  Trash2,
  MessageSquare,
  Filter,
  X,
  Database
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { useSampleData } from "@/hooks/useSampleData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
// import { PerformanceTest } from "@/components/PerformanceTest";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { tasks, isLoading, deleteTask } = useTasks({
    status: statusFilter,
    project_id: projectFilter,
    search: search,
  });
  const { projects } = useProjects();
  const { tags } = useTags();
  const { createSampleData, isLoading: isCreatingSampleData } = useSampleData();

  const filteredTasks = tasks.filter(task => {
    if (selectedTags.length === 0) return true;
    return task.task_tags.some(tt => selectedTags.includes(tt.tags.id));
  });

  const tasksByStatus = {
    pending: filteredTasks.filter(task => task.status === 'pending'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleOpenComments = (task: any) => {
    setSelectedTask(task);
    setCommentsModalOpen(true);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe o progresso dos seus projetos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={createSampleData}
            disabled={isCreatingSampleData}
            variant="outline"
          >
            <Database className="mr-2 h-4 w-4" />
            {isCreatingSampleData ? 'Criando...' : 'Dados Exemplo'}
          </Button>
          <Button onClick={() => {
            setSelectedTask(null);
            setModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Performance Test Section - COMMENTED OUT */}
      {/* <PerformanceTest /> */}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por projeto" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todos os Projetos</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Tags:</span>
            </div>
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map(tag => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
                {selectedTags.includes(tag.id) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks by Status */}
      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <Card key={status}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status)}
                {getStatusText(status)}
                <Badge variant="secondary">{statusTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma tarefa encontrada
                </p>
              ) : (
                statusTasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenComments(task)}
                            title="Ver comentários"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTask(task)}
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
                                <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir a tarefa "{task.title}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {getPriorityText(task.priority)}
                        </Badge>
                        <Badge variant="outline">
                          {task.projects.name}
                        </Badge>
                      </div>

                      {task.task_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.task_tags.map((tt) => (
                            <Badge key={tt.tags.id} variant="secondary" className="text-xs">
                              {tt.tags.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {task.due_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                          {new Date(task.due_date) < new Date() && task.status !== 'completed' && (
                            <Badge variant="destructive" className="ml-2">
                              Vencida
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Comments Modal */}
      <TaskCommentsModal
        open={commentsModalOpen}
        onClose={() => {
          setCommentsModalOpen(false);
          setSelectedTask(null);
        }}
        taskId={selectedTask?.id || ""}
        taskTitle={selectedTask?.title || ""}
      />
    </div>
  );
}
