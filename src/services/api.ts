const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  async get<T>(path: string, params: any = {}): Promise<T> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${path.startsWith('/') ? '' : API_URL + '/'}${path}${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return response.json();
  },

  async getById<T>(path: string, id: string): Promise<T> {
    const response = await fetch(`${path.startsWith('/') ? '' : API_URL + '/'}${path}/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch ${path} with id ${id}`);
    return response.json();
  },

  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${path.startsWith('/') ? '' : API_URL + '/'}${path}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`Failed to create ${path}`);
    return response.json();
  },

  async put<T>(path: string, idOrData: string | any, data?: any): Promise<T> {
    let url = `${path.startsWith('/') ? '' : API_URL + '/'}${path}`;
    let bodyData = idOrData;

    if (typeof idOrData === 'string' && data !== undefined) {
      url = `${url}/${idOrData}`;
      bodyData = data;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(bodyData),
    });
    if (!response.ok) throw new Error(`Failed to update ${path}`);
    return response.json();
  },

  async delete(path: string, id?: string): Promise<boolean> {
    const url = id ? `${path.startsWith('/') ? '' : API_URL + '/'}${path}/${id}` : `${path.startsWith('/') ? '' : API_URL + '/'}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to delete ${path}`);
    return true;
  }
};
