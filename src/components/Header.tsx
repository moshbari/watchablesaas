import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Header: React.FC = () => {
  const { session, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b bg-background relative z-40">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg">Watchables</Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          {!session && (
            <>
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/register"><Button className="text-white">Create account</Button></Link>
            </>
          )}
          {session && (
            <>
              <Link to="/campaigns"><Button variant="ghost">Video Hosting</Button></Link>
              <Link to="/page-builder"><Button variant="ghost">Page Builder</Button></Link>
              <Link to="/leads"><Button variant="ghost">Leads</Button></Link>
              <Link to="/account"><Button variant="ghost">Account</Button></Link>
                  {profile?.role === "admin" && (
                    <Link to="/admin"><Button variant="ghost">Admin</Button></Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link to="/landing-leads"><Button variant="ghost">Landing Leads</Button></Link>
                  )}
                  <Button variant="outline" onClick={signOut}>Sign out</Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col gap-4 mt-8">
              {!session && (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Create account</Button>
                  </Link>
                </>
              )}
              {session && (
                <>
                  <Link to="/campaigns" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Video Hosting</Button>
                  </Link>
                  <Link to="/page-builder" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Page Builder</Button>
                  </Link>
                  <Link to="/leads" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Leads</Button>
                  </Link>
                  <Link to="/account" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">Account</Button>
                  </Link>
                  {profile?.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Admin</Button>
                    </Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link to="/landing-leads" onClick={() => setOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">Landing Leads</Button>
                    </Link>
                  )}
                  <Button variant="outline" onClick={() => { signOut(); setOpen(false); }} className="w-full">
                    Sign out
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
