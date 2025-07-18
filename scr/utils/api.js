import axios from 'axios';

const api = axios.create({
  baseURL: 'http://177.234.231.228:7002',  // Asegúrate de que esta URL sea correcta

});

export default api;