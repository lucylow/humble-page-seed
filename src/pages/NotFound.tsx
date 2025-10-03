import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">      
      <div className="text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <Logo size="xl" showText={true} showTagline={false} variant="full" className="animate-float" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-black dark:text-white">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-center gap-2">
              <span>🏠</span>
              Return to Home
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
