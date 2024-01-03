import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const client = new Keycloak({
  url: "//YOUR KEYCLOAK_URL",
  realm: "// YOUR KEYCLOAK_REALM",
  clientId: "//YOUR KEYCLOAK_CLIENT_ID",
});

const useAuth = () => {
  const isRun = useRef(false);
  const [isLogin, setLogin] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isRun.current) return;

    isRun.current = true;
    client
      .init({
        onLoad: "login-required",
      })
      .then((res) => {
        setLogin(res);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);

  return [isLogin, error];
};

export default useAuth;
