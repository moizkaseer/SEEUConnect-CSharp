//Api configuration - Centralized API URL management

//Get API URL from environment variables or use default 

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5056';

export const API_CONFIG={
  Base_URL:API_BASE_URL,

  EVENTS:{
    GET_ALL_EVENTS:`${API_BASE_URL}/api/events`,
    GET_EVENT_BY_ID:(id:Number)=>`${API_BASE_URL}/api/events/${id}`,
    CREATE:`${API_BASE_URL}/api/events`,
    UPDATE_EVENT:(id:string)=>`${API_BASE_URL}/api/events/${id}`,
    DELETE_EVENT:(id:string)=>`${API_BASE_URL}/api/events/${id}`,
  },

  AUTH:{
    LOGIN:`${API_BASE_URL}/api/auth/login`,
    REGISTER:`${API_BASE_URL}/api/auth/register`,
  },

  USERS:{
    SUBSCRIBE:`${API_BASE_URL}/api/users/subscribe`,
  },

  CHAT:{
    HUB_URL:`${API_BASE_URL}/chathub`,
    GET_MESSAGES:`${API_BASE_URL}/api/chat/messages`,
  }
};

export default API_CONFIG;
