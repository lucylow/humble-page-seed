import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessibility } from './AccessibilityProvider';
import { Accessibility, Contrast, Type, Volume2 } from 'lucide-react';

interface AccessibilitySettingsProps {
  className?: string;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ className = '' }) => {
  const { isHighContrast, fontSize, setFontSize, toggleHighContrast } = useAccessibility();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="high-contrast" className="flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              High Contrast Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Increase contrast for better visibility
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={isHighContrast}
            onCheckedChange={toggleHighContrast}
          />
        </div>

        {/* Font Size Selection */}
        <div className="space-y-2">
          <Label htmlFor="font-size" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Size
          </Label>
          <Select value={fontSize} onValueChange={setFontSize}>
            <SelectTrigger id="font-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Adjust text size for better readability
          </p>
        </div>

        {/* Keyboard Navigation Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Keyboard Navigation</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> to navigate between elements</li>
            <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to activate buttons</li>
            <li>• Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Escape</kbd> to close modals</li>
            <li>• Use arrow keys to navigate menus and lists</li>
          </ul>
        </div>

        {/* Screen Reader Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Screen Reader Support
          </h4>
          <p className="text-sm text-muted-foreground">
            This application includes proper ARIA labels, semantic HTML, and screen reader announcements for all interactive elements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;
