import type { NextFunction, Request, Response } from "express";
import { supabase } from "../lib/supabase";

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

  next();
}