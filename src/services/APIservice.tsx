const API_URL = "http://bufeapi-markomilan.jcloud.jedlik.cloud/api";


export const Login = async (postData: any) => {
  try {
    const response = await fetch(`${API_URL}/account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
  } catch (error) {
    throw error;
  }
};
  export const Logout = async () => {
  try {
    const response = await fetch(`${API_URL}/account/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${document.cookie}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    
  } catch (error) {
    throw error;
  }
};