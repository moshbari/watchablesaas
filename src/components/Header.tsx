import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const { session, profile, signOut } = useAuth();
  return (
    <header className="border-b bg-background">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">Watchables</Link>
        <div className="flex items-center gap-3">
          {!session && (
            <>
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/register"><Button>Create account</Button></Link>
            </>
          )}
          {session && (
            <>
              <Link to="/campaigns"><Button variant="ghost">Campaigns</Button></Link>
              <Link to="/page-builder"><Button variant="ghost">Page Builder</Button></Link>
              <Link to="/account"><Button variant="ghost">Account</Button></Link>
              {profile?.role === "admin" && (
                <Link to="/admin"><Button variant="ghost">Admin</Button></Link>
              )}
              <Button variant="outline" onClick={signOut}>Sign out</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
