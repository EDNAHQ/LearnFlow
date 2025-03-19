
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Always redirect to the home page
    navigate("/home");
  }, [navigate]);

  return null; // No need to render anything as we're redirecting
};

export default Index;
