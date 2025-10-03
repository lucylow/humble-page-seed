import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Enhanced Error Boundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReporting(error, errorInfo, this.state.errorId);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <Card className="w-full max-w-2xl bg-card border border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mb-4">
                <span className="text-6xl">⚠️</span>
              </div>
              <CardTitle className="text-3xl text-destructive">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                We encountered an unexpected error. Don't worry, we're working on it!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              {this.state.errorId && (
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <span>Error ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {this.state.errorId}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={this.copyErrorDetails}
                      className="ml-auto"
                    >
                      Copy Details
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recovery options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What can you do?</h3>
                <div className="grid gap-3">
                  <Button
                    onClick={this.handleRetry}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <span className="mr-2">🔄</span>
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    className="w-full"
                  >
                    <span className="mr-2">🔄</span>
                    Reload Page
                  </Button>
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="w-full"
                  >
                    <span className="mr-2">←</span>
                    Go Back
                  </Button>
                </div>
              </div>

              {/* Error details (collapsible) */}
              {this.state.error && (
                <details className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">
                    Technical Details (Click to expand)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs bg-background p-2 rounded border">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Support information */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  If this problem persists, please contact support with the Error ID above.
                </p>
                <p className="mt-1">
                  We're constantly improving our platform and appreciate your patience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;


