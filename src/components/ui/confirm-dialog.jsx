import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Êtes-vous sûr ?',
  description = 'Cette action est irréversible.',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'destructive',
  icon: Icon,
  iconClassName,
  onConfirm,
  loading = false,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {Icon && (
            <div
              className={cn(
                'mb-2 inline-flex size-10 items-center justify-center rounded-full',
                variant === 'destructive'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary',
                iconClassName,
              )}
            >
              <Icon className="size-5" />
            </div>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Suppression...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
