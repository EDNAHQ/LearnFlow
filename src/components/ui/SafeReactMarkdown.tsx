import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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
  private gfmErrorCount: number = 0;

  constructor(props: SafeReactMarkdownProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      useBasicMarkdown: false,
    };
  }

  static getDerivedStateFromError(error: Error): SafeReactMarkdownState {
    const isGfmError = error.message && (
      error.message.includes('inTable') || 
      error.message.includes('Cannot read properties of undefined') ||
      error.message.includes('remark-gfm') ||
      error.message.includes('gfm')
    );
    
    if (isGfmError) {
      return { hasError: false, error: null, useBasicMarkdown: true };
    }
    return { hasError: true, error, useBasicMarkdown: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isGfmError = error.message && (
      error.message.includes('inTable') || 
      error.message.includes('Cannot read properties of undefined') ||
      error.message.includes('remark-gfm') ||
      error.message.includes('gfm')
    );
    
    if (isGfmError) {
      this.gfmErrorCount += 1;
      if (this.gfmErrorCount > 2 && !this.state.useBasicMarkdown) {
        this.markdownKey += 1;
        this.setState({ useBasicMarkdown: true });
      }
    } else {
      console.error('SafeReactMarkdown caught an error:', error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: SafeReactMarkdownProps) {
    if (prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: null, useBasicMarkdown: false });
      this.markdownKey = 0;
      this.gfmErrorCount = 0;
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
      let remarkPlugins = this.props.remarkPlugins || [];
      
      if (this.state.useBasicMarkdown || this.gfmErrorCount > 2) {
        remarkPlugins = remarkPlugins.filter((plugin: any) => {
          if (!plugin) return true;
          if (plugin === remarkGfm) return false;
          const pluginStr = String(plugin);
          if (pluginStr.includes('remark-gfm') || pluginStr.includes('gfm')) return false;
          if (plugin.name && (plugin.name.includes('gfm') || plugin.name.includes('remark-gfm'))) return false;
          return true;
        });
      }
      
      return (
        <ReactMarkdown
          key={this.markdownKey}
          remarkPlugins={remarkPlugins}
          rehypePlugins={[rehypeRaw]}
          components={this.props.components}
          className={this.props.className}
        >
          {this.props.children}
        </ReactMarkdown>
      );
    } catch (error) {
      const isGfmError = error instanceof Error && (
        error.message.includes('inTable') || 
        error.message.includes('Cannot read properties of undefined')
      );
      
      if (isGfmError && !this.state.useBasicMarkdown) {
        this.gfmErrorCount += 1;
        this.markdownKey += 1;
        this.setState({ useBasicMarkdown: true });
        return null;
      }
      
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

