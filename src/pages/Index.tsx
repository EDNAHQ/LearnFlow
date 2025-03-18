
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to the home page without the slash
    navigate("home");
  }, [navigate]);

  return null; // No need to render anything as we're redirecting
};

export default Index;
