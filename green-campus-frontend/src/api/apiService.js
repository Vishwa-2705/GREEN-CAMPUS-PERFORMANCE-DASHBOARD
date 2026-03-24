const API_BASE_URL = 'http://localhost:5000/api';

// Store token in localStorage
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// ==================== Authentication APIs ====================

export const registerUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setAuthToken(data.access_token);
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setAuthToken(data.access_token);
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logout = () => {
  setAuthToken(null);
};

// ==================== Message APIs ====================

export const sendMessage = async (userName, userEmail, subject, message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        user_email: userEmail,
        subject,
        message,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllMessages = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.messages };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getMessageById = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data: data.message };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const replyToMessage = async (messageId, replyText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/reply`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reply_text: replyText }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data: data.dashboard };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateDashboard = async (dashboard) => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(dashboard),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteMessage = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
