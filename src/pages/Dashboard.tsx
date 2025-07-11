
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskModal } from "@/components/TaskModal";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  FolderOpen
} from "lucide-react";

export default function Dashboard() {
  const [showTaskModal, setShowTaskModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe o progresso dos projetos
          </p>
        </div>
        <Button onClick={() => setShowTaskModal(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Tarefa</span>
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-blue-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-100 dark:bg-green-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              66.7% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-100 dark:bg-yellow-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              25% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-100 dark:bg-red-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              8.3% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar tarefas..." className="pl-10" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:flex md:space-x-4">
              <Select>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Projeto" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="project1">Projeto 1</SelectItem>
                  <SelectItem value="project2">Projeto 2</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Exemplo de tarefa 1 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="bg-task-pending/10 text-task-pending">
                Pendente
              </Badge>
              <Badge variant="outline" className="text-red-600">
                Alta
              </Badge>
            </div>
            <CardTitle className="text-lg">Implementar sistema de login</CardTitle>
            <CardDescription>
              Criar tela de login com validação e integração com backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>15/12/2024</span>
              </div>
              <div className="flex items-center space-x-1">
                <FolderOpen className="h-4 w-4" />
                <span>Sistema Web</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" size="sm">urgente</Badge>
                <Badge variant="outline" size="sm">auth</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exemplo de tarefa 2 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="bg-task-progress/10 text-task-progress">
                Em Progresso
              </Badge>
              <Badge variant="outline" className="text-yellow-600">
                Média
              </Badge>
            </div>
            <CardTitle className="text-lg">Design da página inicial</CardTitle>
            <CardDescription>
              Criar mockups e protótipos da landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>20/12/2024</span>
              </div>
              <div className="flex items-center space-x-1">
                <FolderOpen className="h-4 w-4" />
                <span>Website</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" size="sm">design</Badge>
                <Badge variant="outline" size="sm">ui</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exemplo de tarefa 3 */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <Badge variant="secondary" className="bg-task-completed/10 text-task-completed">
                Concluída
              </Badge>
              <Badge variant="outline" className="text-green-600">
                Baixa
              </Badge>
            </div>
            <CardTitle className="text-lg">Configurar banco de dados</CardTitle>
            <CardDescription>
              Configurar PostgreSQL e criar tabelas iniciais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>10/12/2024</span>
              </div>
              <div className="flex items-center space-x-1">
                <FolderOpen className="h-4 w-4" />
                <span>Sistema Web</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" size="sm">database</Badge>
                <Badge variant="outline" size="sm">setup</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskModal 
        open={showTaskModal} 
        onClose={() => setShowTaskModal(false)} 
      />
    </div>
  );
}
