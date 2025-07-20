const API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Import logger
import logger from "../utils/logger";

export async function login(emailOrUsername: string, password: string) {
  const startTime = Date.now();
  
  logger.debug("Login API call started", {
    emailOrUsername: emailOrUsername ? "***" : "empty",
    hasPassword: !!password
  });

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type" : "application/json" },
      credentials: "include",
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const duration = Date.now() - startTime;

    if (!res.ok) {
      const data = await res.json();
      const errorMsg = data.message || data.error || "Failed to login";
      
      logger.error("Login API call failed", {
        status: res.status,
        statusText: res.statusText,
        error: errorMsg,
        duration: `${duration}ms`
      });
      
      throw new Error(errorMsg);
    }

    const responseData = await res.json();
    
    logger.info("Login API call successful", {
      status: res.status,
      requiresVerification: responseData.requiresVerification,
      duration: `${duration}ms`
    });

    return responseData;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Login API call exception", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`
    }, error instanceof Error ? error : undefined);
    throw error;
  }
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: { "Content-Type" : "application/json"},
    credentials: "include",
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to logout");
  }
}

export async function signUp(username: string, display_name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { "Content-Type" : "application/json" },
    credentials: "include",
    body: JSON.stringify({username, display_name, email, password})
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to Create Account");
  }
  
  return res.json();
}

export async function verifyCode(email: string, code: string) {
  const startTime = Date.now();
  
  logger.debug("Verify code API call started", {
    email: email ? "***" : "empty",
    codeLength: code.length
  });

  try {
    const res = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, code })
    });

    const duration = Date.now() - startTime;

    if (!res.ok) {
      const { error, message } = await res.json();
      const errorMsg = error || message || "Failed to verify code";
      
      logger.error("Verify code API call failed", {
        status: res.status,
        statusText: res.statusText,
        error: errorMsg,
        duration: `${duration}ms`
      });
      
      throw new Error(errorMsg);
    }

    const responseData = await res.json();
    
    logger.info("Verify code API call successful", {
      status: res.status,
      duration: `${duration}ms`
    });

    return responseData;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Verify code API call exception", {
      error: error instanceof Error ? error.message : "Unknown error",
      duration: `${duration}ms`
    }, error instanceof Error ? error : undefined);
    throw error;
  }
}

export async function resendCode(email: string) {
  const res = await fetch(`${API_URL}/api/auth/resend-code`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email })
  });
  if (!res.ok) {
    const { error, message } = await res.json();
    throw new Error(error || message || "Failed to resend code");
  }
  return res.json();
}