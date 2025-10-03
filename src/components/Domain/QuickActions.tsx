import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const QuickActions: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <span className="mr-2">🔗</span>
            Tokenize Domain
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700"
          >
            <span className="mr-2">📊</span>
            View Analytics
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
          >
            <span className="mr-2">🎯</span>
            Start Tour
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
