import api from './api.js';

export const auth = {
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getEmpresa() {
    const empresa = localStorage.getItem('empresa');
    return empresa ? JSON.parse(empresa) : null;
  },

  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    
    api.setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.usuario));
    localStorage.setItem('empresa', JSON.stringify(response.empresa));
    
    return response;
  },

  async cadastro(dados) {
    const response = await api.post('/auth/cadastro', dados);
    
    api.setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.usuario));
    localStorage.setItem('empresa', JSON.stringify(response.empresa));
    
    return response;
  },

  logout() {
    api.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('empresa');
    window.location.hash = '#/login';
  }
};
