import { useEffect } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { useToast } from '@/hooks/use-toast';

export function useShopkeeperWebSocket() {
  const { connect, disconnect, on, isConnected } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeNewOrder = on('new_order', (data: any) => {
      toast({
        title: 'Nouvelle commande',
        description: `Commande de ${data.clientName}`,
      });
    });

    const unsubscribeNewMessage = on('new_message', (data: any) => {
      toast({
        title: 'Nouveau message',
        description: `Message de ${data.senderName}`,
      });
    });

    return () => {
      unsubscribeNewOrder();
      unsubscribeNewMessage();
    };
  }, [isConnected, on, toast]);

  return { isConnected };
}