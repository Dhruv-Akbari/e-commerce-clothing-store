
import { useState, useEffect } from "react";

export default function useUserId() {
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.id || null;
    } catch {
      return null;
    }
  };

  const [userId, setUserId] = useState(getUserId);

  useEffect(() => {
    const updateUser = () => {
      setUserId(getUserId());
    };

    window.addEventListener("userUpdated", updateUser);
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("userUpdated", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  return userId;
}
