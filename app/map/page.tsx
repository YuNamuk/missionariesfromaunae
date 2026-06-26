import { redirect } from "next/navigation";

// The map moved to the site root; keep /map working as an alias.
export default function MapPage() {
  redirect("/");
}
