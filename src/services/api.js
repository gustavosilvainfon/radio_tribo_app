import { RADIO_CONFIG } from '../config/radio';

class ApiService {
  constructor() {
    this.baseUrl = RADIO_CONFIG.API_URL;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  }

  // Métodos específicos da rádio
  async getRadioInfo() {
    return this.get('/radio/info');
  }

  async getNowPlaying() {
    return this.get('/radio/now-playing');
  }

  async getSchedule() {
    return this.get('/radio/schedule');
  }

  async registerListenerJoin() {
    return this.post('/stats/listener-join', {});
  }

  async registerListenerLeave(listenTime) {
    return this.post('/stats/listener-leave', { listen_time: listenTime });
  }
}

export default new ApiService();