
import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSettingsModal = ({ isOpen, onClose }: UserSettingsModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    if (!fullName.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome completo é obrigatório',
        variant: 'destructive',
      });
      return false;
    }

    if (newPassword && newPassword.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      });
      return false;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione apenas arquivos de imagem',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(data.publicUrl);

      toast({
        title: 'Sucesso',
        description: 'Avatar atualizado com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao fazer upload do avatar',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !avatarUrl) return;

    try {
      // Se há um avatar atual, tentar removê-lo do storage
      if (avatarUrl && avatarUrl.includes('avatars')) {
        const fileName = avatarUrl.split('/avatars/')[1];
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([fileName]);
        }
      }

      setAvatarUrl('');
      
      toast({
        title: 'Sucesso',
        description: 'Avatar removido com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao remover avatar',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Atualizar dados do usuário
      const updates: any = {
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      };

      // Se uma nova senha foi fornecida, incluí-la na atualização
      if (newPassword) {
        updates.password = newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: 'Sucesso',
        description: 'Configurações atualizadas com sucesso!',
      });

      onClose();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar configurações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg">
                {fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || user?.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Alterar Avatar
              </Button>

              {avatarUrl && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Avatar</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover seu avatar? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveAvatar}>
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Alterar Senha</h3>
            
            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite uma nova senha (opcional)"
              />
            </div>

            {newPassword && (
              <div>
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
