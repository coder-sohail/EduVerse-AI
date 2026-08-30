import type { NextFunction, Request, Response } from "express";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: User;
      supabaseRole?: "student" | "teacher";
    }
  }
}

export async function requireSupabaseAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Supabase login required" });
    return;
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid Supabase session" });
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    res.status(500).json({ error: "Unable to load Supabase profile" });
    return;
  }

  req.supabaseUser = data.user;
  req.supabaseRole = profile?.role === "teacher" || profile?.role === "student"
    ? profile.role
    : undefined;
  next();
}

export function requireTeacher(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.supabaseRole !== "teacher") {
    res.status(403).json({ error: "Teacher profile required" });
    return;
  }
  next();
}