import { useEffect } from 'react';
import { useToast } from '@/hooks/use_toast';
import { Toaster } from '@/components/ui/toaster';
import { router, usePage } from '@inertiajs/react';

export default function FlashToasts() {
  const { flash } = usePage();
  const { toast } = useToast();

  useEffect(() => {
    const dismiss = router.on('start', () => {
      // Dismiss all toasts on navigation start
    });

    return dismiss;
  }, []);

  useEffect(() => {
    if (flash.error) {
      toast({
        title: 'Error',
        description: flash.error,
      });
    }
    if (flash.success) {
      toast({
        title: 'Success',
        description: flash.success,
      });
    }
  }, [flash, toast]);

  return <Toaster />;
}
