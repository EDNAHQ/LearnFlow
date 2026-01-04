import { useEffect } from "react";

const SignIn = () => {
  useEffect(() => {
    window.location.href = "https://enterprisedna.co/login?edna=1";
  }, []);
  return null;
};

export default SignIn;
