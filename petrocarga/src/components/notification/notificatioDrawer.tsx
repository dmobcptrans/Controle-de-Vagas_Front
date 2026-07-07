'use client';

import { Bell, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useNotifications } from '@/contexts/NotificationContext';

type NotificationDrawerProps = {
  isMobile?: boolean;
};

export function NotificationDrawer({
  isMobile = false,
}: NotificationDrawerProps) {
  const router = useRouter();

  const { notifications, markAsRead, isLoading } = useNotifications();
  const [open, setOpen] = useState(false);
  const latestNotifications = notifications.slice(0, 4);
  const unreadCount = notifications.filter((n) => !n.lida).length;

  async function handleClick(id: string) {
    await markAsRead(id);
    setOpen(false);
    router.push('/notificacoes');
  }

  // =========================
  // TRIGGER (BOTÃO DO SINO)
  // =========================
  const TriggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-10 w-10 rounded-xl hover:bg-muted/20 focus-visible:ring-1 focus-visible:ring-ring"
    >
      <Bell className="h-[22px] w-[22px] text-white transition-colors duration-200" />

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground ring-2 ring-background animate-in fade-in zoom-in-75 duration-300">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );

  // =========================
  // CONTEÚDO DA LISTA
  // =========================
  const NotificationContent = (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3.5">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Notificações</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suas atualizações mais recentes
          </p>
        </div>

        {unreadCount > 0 && (
          <Badge
            variant="secondary"
            className="rounded-md px-2 py-0.5 text-xs font-medium bg-secondary/80 text-secondary-foreground"
          >
            {unreadCount} novas
          </Badge>
        )}
      </div>

      {/* Lista de Notificações */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            Carregando notificações...
          </div>
        ) : latestNotifications.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
              <Bell className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <p className="text-xs font-medium">Tudo limpo por aqui!</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[200px]">
              Você não tem nenhuma nova notificação no momento.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {latestNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification.id)}
                className={`flex w-full gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-muted/40 focus-visible:bg-muted/60 focus-visible:outline-none ${
                  !notification.lida ? 'bg-muted/20' : ''
                }`}
              >
                {/* Ícone Lateral interno da lista */}
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    !notification.lida
                      ? 'bg-primary/10 text-primary dark:bg-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>

                {/* Textos */}
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`text-xs leading-none truncate ${
                        !notification.lida
                          ? 'font-semibold text-foreground'
                          : 'font-medium text-muted-foreground'
                      }`}
                    >
                      {notification.titulo}
                    </h4>
                    {!notification.lida && (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>

                  <p
                    className={`text-xs leading-normal line-clamp-2 ${
                      !notification.lida
                        ? 'text-foreground/90'
                        : 'text-muted-foreground/90'
                    }`}
                  >
                    {notification.mensagem}
                  </p>

                  <p className="text-[10px] text-muted-foreground/60 font-medium pt-0.5">
                    {formatDistanceToNow(new Date(notification.criadaEm), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border/60 p-2 bg-muted/5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            setOpen(false);
            router.push('/notificacoes');
          }}
        >
          <span>Ver todas as notificações</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  // =========================
  // MOBILE → LEFT DRAWER
  // =========================
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
        {/* Lado alterado para "left", largura definida para w-1/2 (metade da tela) e cantos arredondados na direita */}
        <SheetContent
          side="left"
          className="w-6/7 h-full p-0 rounded-r-[20px] overflow-hidden border-r"
        >
          {NotificationContent}
        </SheetContent>
      </Sheet>
    );
  }

  // =========================
  // DESKTOP → POPOVER
  // =========================
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 overflow-hidden rounded-xl shadow-lg border border-border/80"
      >
        {NotificationContent}
      </PopoverContent>
    </Popover>
  );
}
