import React, { useState } from "react";
import AuthLayout from "../components/Auth/AuthLayout";
import SignUp from "../components/Auth/SignUp";
import SignIn from "../components/Auth/SignIn";

const AuthPage: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(false);

  return (
    <AuthLayout>
      {isSignIn ? (
        <SignIn onSwitch={() => setIsSignIn(false)} />
      ) : (
        <SignUp onSwitch={() => setIsSignIn(true)} />
      )}
    </AuthLayout>
  );
};

export default AuthPage;
