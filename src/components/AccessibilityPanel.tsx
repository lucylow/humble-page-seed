import { useState, useEffect } from 'react';
import { Accessibility, Moon, Sun, Type, Minus, Plus, RotateCcw } from 'lucide-react';

export const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize(prev => prev + 2);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize(prev => prev - 2);
  };

  const reset = () => {
    setFontSize(16);
    setHighContrast(false);
    setDarkMode(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform z-50 flex items-center justify-center"
        aria-label="Accessibility options"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 bg-card border border-border rounded-xl p-4 shadow-xl z-50 w-64 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">Accessibility Options</h3>
          
          <div className="space-y-3">
            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
            >
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* High Contrast */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <Accessibility className="w-5 h-5" />
              <span className="text-sm">High Contrast</span>
              {highContrast && <span className="ml-auto text-xs text-primary font-semibold">ON</span>}
            </button>

            {/* Font Size */}
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-muted-foreground" />
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 12}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Decrease font size"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium flex-1 text-center">{fontSize}px</span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 24}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Increase font size"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left text-sm"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Settings</span>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            <p>Keyboard shortcuts:</p>
            <p className="mt-1">Ctrl+K - Search</p>
            <p>Ctrl+/ - This panel</p>
          </div>
        </div>
      )}
    </>
  );
};
