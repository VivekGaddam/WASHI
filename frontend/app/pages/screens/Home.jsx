import React from "react";
import { useAuth } from "../../../context/AuthContext";
import NormalUserHome from "./NormalUserHome.jsx";
import AdminHome from "./AdminHome.jsx";

export default function Home() {
  const { user } = useAuth();

  if (!user) return null; 

  switch (user.role) {
    case "admin":
      return <AdminHome />;
    case "user":
    default:
      return <NormalUserHome />;
  }
}
