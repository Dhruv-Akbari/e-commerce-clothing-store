
import { useCookies } from "react-cookie";

export default function useUserId() {
  const [cookies] = useCookies(["userId"]);

  return cookies.userId ?? null;
}
