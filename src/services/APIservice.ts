
const API_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || '/api')
  : (import.meta.env.VITE_API_URL || "http://bufeapi-markomilan.jcloud.jedlik.cloud/api");

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};
export const Login = async (postData: any) => {
  try {
    const response = await fetch(`${API_URL}/account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(postData),
      redirect: 'follow',
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      throw new Error(`Error: ${response.status} ${response.statusText} - ${bodyText}`);
      return false;
    }
    const data = await response.json();
    document.cookie = `token=${data.access_token}; expires= ${(new Date(Date.now() + 1000*60*60*24*30)).toUTCString()}; path=/`
    return true;
  } catch (error) {
    throw error;
    return false;
  }
};

  export const Logout = async () => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/account/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    return data;
    
  } catch (error) {
    throw error;
  }
};


