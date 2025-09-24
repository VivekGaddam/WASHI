import React from "react";
import { useAuth } from "../../../context/AuthContext";
import UserHome from "./UserHome.jsx";
import AdminHome from "./AdminHome.jsx";

export default function Home() {
  const { user } = useAuth();

  if (!user) return null; 

  switch (user.role) {
    case "admin":
      return <AdminHome />;
    case "user":
    default:
      return <UserHome />;
  }
}
