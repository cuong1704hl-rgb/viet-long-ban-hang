import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                    <h1>Đã xảy ra lỗi (Application Error)</h1>
                    <p>Hệ thống gặp sự cố không mong muốn. Vui lòng chụp ảnh màn hình này gửi cho hỗ trợ kỹ thuật.</p>
                    <details style={{ whiteSpace: 'pre-wrap', background: '#f8f8f8', padding: '10px', borderRadius: '5px' }}>
                        <summary>Chi tiết lỗi (Click để xem)</summary>
                        <p style={{ color: 'red', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                        <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '20px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        Tải lại trang (Reload)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
