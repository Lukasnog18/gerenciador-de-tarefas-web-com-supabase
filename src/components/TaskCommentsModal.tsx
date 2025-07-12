
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useComments } from "@/hooks/useComments";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
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

interface TaskCommentsModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

export function TaskCommentsModal({ open, onClose, taskId, taskTitle }: TaskCommentsModalProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const { comments, isLoading, createComment, deleteComment } = useComments(taskId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      return;
    }

    try {
      await createComment.mutateAsync({
        task_id: taskId,
        content: newComment.trim(),
      });
      setNewComment("");
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentários - {taskTitle}
          </DialogTitle>
          <DialogDescription>
            Adicione comentários para acompanhar o progresso da tarefa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Form to add new comment */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="comment">Novo Comentário</Label>
              <Textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Digite seu comentário aqui..."
                className="resize-none"
                rows={3}
                required
              />
            </div>
            <Button 
              type="submit" 
              disabled={!newComment.trim() || createComment.isPending}
              className="w-full"
            >
              {createComment.isPending ? 'Adicionando...' : 'Adicionar Comentário'}
            </Button>
          </form>

          {/* Comments list */}
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Carregando comentários...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">
                          {comment.profiles.full_name || comment.profiles.email}
                        </span>
                        <span>•</span>
                        <span>
                          {format(new Date(comment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{comment.content}</p>
                    </div>
                    {comment.user_id === user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Comentário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteComment(comment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
