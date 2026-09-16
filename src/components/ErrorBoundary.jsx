import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.href = window.location.pathname
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-muted">
          <AlertTriangle className="size-8 text-warning" />
        </div>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Oups, quelque chose s'est mal passé
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Une erreur inattendue est survenue. Rechargez la page ou revenez à l'accueil pour continuer.
        </p>
        <div className="flex gap-3">
          <Button onClick={this.handleReload}>
            <RefreshCw className="size-4" />
            Recharger
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Accueil</a>
          </Button>
        </div>
        {this.state.error?.message && (
          <p className="max-w-md rounded-lg border border-border bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            {this.state.error.message}
          </p>
        )}
      </div>
    )
  }
}