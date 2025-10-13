/**
 * API Demo Page - Showcases public API integrations
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PublicApiDemo } from "@/components/PublicApiDemo";

const ApiDemo = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Public API Integrations Demo
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore free, open APIs with no authentication required
          </p>
        </header>

        <PublicApiDemo />
      </div>
    </div>
  );
};

export default ApiDemo;

