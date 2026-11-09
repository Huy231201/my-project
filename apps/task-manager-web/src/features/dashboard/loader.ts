import { redirect } from "react-router";
import { getMe } from "@/features/auth/api";

export async function dashboardLoader() {
  const { success, status, data } = await getMe();

  if (status === 401) {
    return redirect("/login");
  }

  if (!success) {
    throw new Response("Failed to load user", { status });
  }

  return data;
}
