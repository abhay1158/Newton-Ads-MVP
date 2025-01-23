import { useState } from 'react';
import { Toast } from '@/components/ui/toast';

export function NewtonAgent() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="h-[700px]">
          <iframe
            src="https://udify.app/chatbot/PYyu7YNjxQOKyZBC"
            style={{ width: '100%', height: '100%', minHeight: '700px' }}
            frameBorder="0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads allow-top-navigation"
            allow="microphone"
            title="Newton AI Agent"
          />
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}