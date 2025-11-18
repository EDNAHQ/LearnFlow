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
  useBasicMarkdown: boolean;
}

class SafeReactMarkdown extends Component<SafeReactMarkdownProps, SafeReactMarkdownState> {
  private markdownKey: number = 0;

  constructor(props: SafeReactMarkdownProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      useBasicMarkdown: false,
    };
  }

  static getDerivedStateFromError(error: Error): SafeReactMarkdownState {
    // If it's a remark-gfm error, try without it
    const isGfmError = error.message && (
      error.message.includes('inTable') || 
      error.message.includes('remark-gfm') ||
      error.message.includes('gfm')
    );
    
    if (isGfmError) {
      return { hasError: false, error: null, useBasicMarkdown: true };
    }
    return { hasError: true, error, useBasicMarkdown: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SafeReactMarkdown caught an error:', error, errorInfo);
    // If it's a remark-gfm error, increment key to force remount without gfm
    const isGfmError = error.message && (
      error.message.includes('inTable') || 
      error.message.includes('remark-gfm') ||
      error.message.includes('gfm')
    );
    
    if (isGfmError && !this.state.useBasicMarkdown) {
      this.markdownKey += 1;
      this.setState({ useBasicMarkdown: true });
    }
  }

  componentDidUpdate(prevProps: SafeReactMarkdownProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null, useBasicMarkdown: false });
      this.markdownKey = 0;
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
      // If remark-gfm causes errors, fall back to basic markdown
      let remarkPlugins = this.props.remarkPlugins || [];
      
      // Filter out remark-gfm if we've encountered errors before
      if (this.state.useBasicMarkdown) {
        remarkPlugins = remarkPlugins.filter((plugin: any) => {
          // Check if it's remark-gfm by checking the plugin reference or name
          if (!plugin) return true;
          // Check by reference (if it's the imported remarkGfm)
          if (plugin === remarkGfm) return false;
          // Check by string representation
          const pluginStr = plugin.toString();
          if (pluginStr.includes('remark-gfm') || pluginStr.includes('gfm')) return false;
          // Check by name property
          if (plugin.name && (plugin.name.includes('gfm') || plugin.name.includes('remark-gfm'))) return false;
          return true;
        });
      }
      
      return (
        <ReactMarkdown
          key={this.markdownKey}
          remarkPlugins={remarkPlugins}
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

