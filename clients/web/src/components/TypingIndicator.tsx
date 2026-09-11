export const TypingIndicator = () => (
  <div className="flex gap-1 items-center px-3 py-2">
    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse-dot" style={{ animationDelay: '0ms' }} />
    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse-dot" style={{ animationDelay: '150ms' }} />
    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse-dot" style={{ animationDelay: '300ms' }} />
  </div>
);
