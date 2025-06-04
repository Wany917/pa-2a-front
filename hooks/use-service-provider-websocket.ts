import { useEffect } from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { useToast } from '@/hooks/use-toast';

export function useServiceProviderWebSocket() {
  const { connect, disconnect, on, isConnected } = useWebSocket();
  const { toast } = useToast();

  useEffect(() => {
    if (!isConnected) return;

    const unsubscribeNewIntervention = on('new_intervention_request', (data: any) => {
      toast({
        title: 'Nouvelle demande d\'intervention',
        description: data.serviceType,
      });
    });

    const unsubscribeNewMessage = on('new_message', (data: any) => {
      toast({
        title: 'Nouveau message',
        description: `Message de ${data.senderName}`,
      });
    });

    return () => {
      unsubscribeNewIntervention();
      unsubscribeNewMessage();
    };
  }, [isConnected, on, toast]);

  return { isConnected };
}