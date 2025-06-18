// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('adminToken');
        this.baseUrl = '/api';
        this.init();
    }

    init() {
        if (this.token && this.isTokenValid()) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginSubmit').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Now playing form
        document.getElementById('nowPlayingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateNowPlaying();
        });

        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        // Auto refresh dashboard every 30 seconds
        setInterval(() => {
            if (!document.getElementById('dashboard').classList.contains('hidden')) {
                this.loadDashboardData();
            }
        }, 30000);
    }

    showLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    isTokenValid() {
        if (!this.token) return false;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch (e) {
            return false;
        }
    }

    async apiCall(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            this.showAlert(error.message, 'error');
            throw error;
        }
    }

    async login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const data = await this.apiCall('/admin/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            this.token = data.token;
            localStorage.setItem('adminToken', this.token);
            
            this.showDashboard();
            this.loadDashboardData();
            this.showAlert('Login realizado com sucesso!', 'success');
        } catch (error) {
            document.getElementById('loginAlert').textContent = error.message;
            document.getElementById('loginAlert').classList.remove('hidden');
        }
    }

    logout() {
        localStorage.removeItem('adminToken');
        this.token = null;
        this.showLogin();
    }

    async loadDashboardData() {
        try {
            // Load dashboard stats
            const dashboard = await this.apiCall('/admin/dashboard');
            this.updateStats(dashboard);

            // Load settings
            const settings = await this.apiCall('/admin/settings');
            this.populateSettings(settings);

            // Load schedule
            const schedule = await this.apiCall('/admin/schedule');
            this.populateSchedule(schedule);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    updateStats(data) {
        const currentListeners = data.todayStats?.listeners_count || 0;
        const peakListeners = data.todayStats?.peak_listeners || 0;
        const avgTime = data.todayStats?.avg_listen_time || 0;
        const totalSessions = data.todayStats?.total_sessions || 0;

        document.getElementById('currentListeners').textContent = currentListeners;
        document.getElementById('peakListeners').textContent = peakListeners;
        document.getElementById('avgTime').textContent = Math.round(avgTime / 60);
        document.getElementById('totalSessions').textContent = totalSessions;
    }

    populateSettings(settings) {
        const fields = [
            'radio_name', 'radio_slogan', 'stream_url', 'phone', 
            'email', 'facebook', 'instagram', 'whatsapp'
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.replace('_', '').replace('radio', 'radio'));
            const key = field === 'radio_name' ? 'radioName' : 
                       field === 'radio_slogan' ? 'radioSlogan' :
                       field === 'stream_url' ? 'streamUrl' : field;
            
            const input = document.getElementById(key);
            if (input && settings[field]) {
                input.value = settings[field].value;
            }
        });
    }

    populateSchedule(schedule) {
        const tbody = document.getElementById('scheduleTable');
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        
        tbody.innerHTML = '';

        schedule.forEach(item => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${days[item.day_of_week]}</td>
                <td>${item.start_time} - ${item.end_time}</td>
                <td>${item.show_name}</td>
                <td>${item.host_name || '-'}</td>
                <td>
                    <span class="badge ${item.is_active ? 'bg-success' : 'bg-secondary'}">
                        ${item.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editSchedule(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSchedule(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        });
    }

    async updateNowPlaying() {
        const songTitle = document.getElementById('songTitle').value;
        const artist = document.getElementById('artist').value;
        const album = document.getElementById('album').value;
        const duration = document.getElementById('duration').value;

        try {
            await this.apiCall('/radio/update-now-playing', {
                method: 'POST',
                body: JSON.stringify({
                    song_title: songTitle,
                    artist: artist,
                    album: album || null,
                    duration: duration ? parseInt(duration) : null
                })
            });

            this.showAlert('Música atualizada com sucesso!', 'success');
            document.getElementById('nowPlayingForm').reset();
        } catch (error) {
            this.showAlert('Erro ao atualizar música: ' + error.message, 'error');
        }
    }

    async saveSettings() {
        const settings = {
            radio_name: document.getElementById('radioName').value,
            radio_slogan: document.getElementById('radioSlogan').value,
            stream_url: document.getElementById('streamUrl').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            facebook: document.getElementById('facebook').value,
            instagram: document.getElementById('instagram').value,
            whatsapp: document.getElementById('whatsapp').value
        };

        try {
            await this.apiCall('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            this.showAlert('Configurações salvas com sucesso!', 'success');
        } catch (error) {
            this.showAlert('Erro ao salvar configurações: ' + error.message, 'error');
        }
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }
}

// Global functions for schedule management
async function editSchedule(id) {
    // TODO: Implement schedule editing modal
    console.log('Edit schedule:', id);
}

async function deleteSchedule(id) {
    if (confirm('Tem certeza que deseja excluir este item da programação?')) {
        try {
            await adminPanel.apiCall(`/admin/schedule/${id}`, {
                method: 'DELETE'
            });
            adminPanel.showAlert('Item removido com sucesso!', 'success');
            adminPanel.loadDashboardData();
        } catch (error) {
            console.error('Error deleting schedule:', error);
        }
    }
}

function addScheduleItem() {
    // TODO: Implement add schedule modal
    console.log('Add schedule item');
}

function logout() {
    adminPanel.logout();
}

// Initialize admin panel when page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});