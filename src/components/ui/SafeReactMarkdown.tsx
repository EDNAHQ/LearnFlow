import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertCircle } from 'lucide-react';

interface SafeReactMarkdownProps {
  children: string;
  remarkPlugins?: any[];
  components?: any;
  className?: string;
}

interface SafeReactMarkdownState {
  hasError: boolean;
  error: Error | null;
}

class SafeReactMarkdown extends Component<SafeReactMarkdownProps, SafeReactMarkdownState> {
  constructor(props: SafeReactMarkdownProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): SafeReactMarkdownState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeReactMarkdown caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: SafeReactMarkdownProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 mb-1">
                Error rendering content
              </p>
              <p className="text-sm text-red-600 mb-3">
                There was an issue displaying this content. Please try refreshing the page.
              </p>
              <pre className="text-xs text-red-500 bg-red-100 p-2 rounded overflow-auto max-h-32">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </div>
          </div>
        </div>
      );
    }

    try {
      return (
        <ReactMarkdown
          remarkPlugins={this.props.remarkPlugins || [remarkGfm]}
          components={this.props.components}
          className={this.props.className}
        >
          {this.props.children}
        </ReactMarkdown>
      );
    } catch (error) {
      console.error('Error in SafeReactMarkdown render:', error);
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Error rendering content
              </p>
              <p className="text-sm text-red-600 mt-1">
                {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default SafeReactMarkdown;

