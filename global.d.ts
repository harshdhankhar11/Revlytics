interface RazorpayInstance {
    open: () => void;
}

interface RazorpayConstructor {
    new(options: Record<string, unknown>): RazorpayInstance;
}

declare global {
    interface Window {
        Razorpay?: RazorpayConstructor;
    }
}

export { };
