import api from "../lib/api";

export interface CreateCheckoutItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  description?: string;
}

export interface CreateCheckoutSessionRequest {
  items: CreateCheckoutItem[];
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface VerifyCheckoutSessionResponse {
  id: string;
  status: string;
  amountTotal?: number;
  currency?: string;
}

interface JavaResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export const checkoutService = {
  async createUserSession(payload: CreateCheckoutSessionRequest): Promise<{ url: string; sessionId?: string }> {
    try {
      // If no auth token, fall back to guest session
      let token = '';
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('authToken') || localStorage.getItem('now_token') || '';
      }

      const endpoint = token ? "/api/v1/checkout/create-user-session" : "/api/v1/checkout/guest/create-session";

      const response = await api.post<JavaResponse<{ url?: string; sessionId?: string; checkoutUrl?: string }>>(
        endpoint,
        payload
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        return { url: data.url || data.checkoutUrl || "", sessionId: data.sessionId };
      }

      // Log full payload from backend to surface validation errors
      console.error("Create user session failed:", response.data);
      throw new Error(response.data.message || "Failed to create checkout session");
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      console.error("Error creating user checkout session:", serverMessage || error?.message || error);
      throw new Error(serverMessage || error.message || "Failed to create checkout session");
    }
  },

  async createGuestSession(payload: CreateCheckoutSessionRequest): Promise<{ url: string; sessionId?: string }> {
    try {
      const response = await api.post<JavaResponse<{ url?: string; sessionId?: string; checkoutUrl?: string }>>(
        "/api/v1/checkout/guest/create-session",
        payload
      );

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        return { url: data.url || data.checkoutUrl || "", sessionId: data.sessionId };
      }

      console.error("Create guest session failed:", response.data);
      throw new Error(response.data.message || "Failed to create guest checkout session");
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      console.error("Error creating guest checkout session:", serverMessage || error?.message || error);
      throw new Error(serverMessage || error.message || "Failed to create checkout session");
    }
  },

  async verifySession(sessionId: string): Promise<VerifyCheckoutSessionResponse> {
    try {
      const response = await api.get<JavaResponse<VerifyCheckoutSessionResponse>>(
        `/api/v1/checkout/verify/${sessionId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to verify checkout session");
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
      console.error("Error verifying checkout session:", serverMessage || error?.message || error);
      throw new Error(serverMessage || error.message || "Failed to verify checkout session");
    }
  },
};


