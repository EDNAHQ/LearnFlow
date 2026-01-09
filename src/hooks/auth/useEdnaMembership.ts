import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useEdnaMembership = () => {
  const [loading, setLoading] = useState(false);

  const checkMembershipAndRedirect = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("edna-sso", {
        body: {},
      });

      if (error) {
        console.error("Error getting SSO params:", error);
        window.open("https://app.enterprisedna.co/app", "_blank");
        return;
      }

      console.log(data);

      if (data?.success && data.sso && data.sig) {
        const loginUrl = `https://app.enterprisedna.co/supabase/login?sso=${data.sso}&sig=${data.sig}`;
        window.open(loginUrl, "_blank");
      } else {
        window.open("https://app.enterprisedna.co/app", "_blank");
      }
    } catch (error) {
      console.error("Error checking EDNA membership:", error);
      window.open("https://app.enterprisedna.co/app", "_blank");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkMembership = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("edna-sso", {
        body: {},
      });

      if (error || !data?.success || !data.sso || !data.sig) {
        return false;
      }

      const checkUrl = `https://app.enterprisedna.co/api/v1/supabase/check?sso=${data.sso}&sig=${data.sig}`;
      const response = await fetch(checkUrl);

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.has_access === true;
    } catch (error) {
      console.error("Error checking membership:", error);
      return false;
    }
  }, []);

  const processAutoSSO = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ssoPayload = urlParams.get("sso");
    const signature = urlParams.get("sig");

    if (!ssoPayload || !signature) {
      return;
    }

    // Ensure SSO loading screen is visible (reinforces the index.html script)
    const showSSOLoadingScreen = () => {
      // Check if loading screen already exists
      if (document.getElementById("sso-loading-screen")) {
        return;
      }

      // Create loading screen overlay
      const loadingScreen = document.createElement("div");
      loadingScreen.id = "sso-loading-screen";
      loadingScreen.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: white; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999999;">
          <div style="animation: sso-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
            <img src="/EDNA Logo.png" alt="EDNA" style="width: 128px; height: 128px; object-fit: contain;" />
          </div>
        </div>
        <style>
          @keyframes sso-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
      `;
      document.body.appendChild(loadingScreen);
    };

    // Show loading screen immediately
    showSSOLoadingScreen();

    try {
      const { data, error } = await supabase.functions.invoke("sso-login", {
        body: {
          sso: ssoPayload,
          sig: signature,
        },
      });

      if (error) {
        console.error("SSO login error:", error);
        // Remove loading screen on error
        const loadingScreen = document.getElementById("sso-loading-screen");
        if (loadingScreen) {
          loadingScreen.remove();
        }
        return;
      }

      if (data?.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error("Auto SSO processing error:", error);
      // Remove loading screen on error
      const loadingScreen = document.getElementById("sso-loading-screen");
      if (loadingScreen) {
        loadingScreen.remove();
      }
    }
  }, []);

  return { checkMembershipAndRedirect, checkMembership, processAutoSSO, loading };
};
