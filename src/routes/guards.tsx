import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6"><Skeleton className="h-6 w-40 mb-3" /><Skeleton className="h-24 w-full" /></div>;
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

export const RequireRole: React.FC<{ allow: ("admin"|"user"|"interested")[]; children: React.ReactNode }> = ({ allow, children }) => {
  const { role, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6"><Skeleton className="h-6 w-40 mb-3" /><Skeleton className="h-24 w-full" /></div>;
  }
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!role || !allow.includes(role)) return <Navigate to="/account" replace />;
  return <>{children}</>;
};
