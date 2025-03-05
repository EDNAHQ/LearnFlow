
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to the home page
    navigate("/home");
  }, [navigate]);

  return null; // No need to render anything as we're redirecting
};

export default Index;
