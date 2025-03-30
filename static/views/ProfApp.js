const ProfApp = Vue.component('ProfApp', {
  template: `
  <div>
    <!-- Bootstrap Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-nav mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Professional Dashboard</a>
        <div class="collapse navbar-collapse">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/professional" class="nav-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/professional/search" class="nav-link">Search</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/professional/summary" class="nav-link">Summary</router-link>
            </li>
          </ul>
          <div class="d-flex">
            <button class="btn btn-primary me-2" @click="viewProfile">
              <i class="bi bi-person-fill"></i> Profile
            </button>
            <button class="btn btn-outline-warning" @click="logout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container-fluid" v-if="isAuthenticated">
      <div class="alert alert-light mb-4">
        <h4>Welcome, {{ currentProfessional.name }}!</h4>
        <div class="alert alert-info mt-3">
        <strong>{{ pendingRequests }}</strong> pending service requests
        <router-link v-if="pendingRequests > 0" 
                    to="/professional/requests"
                    class="btn btn-sm btn-primary ms-3">
          View Requests
        </router-link>
      </div>
      </div>

      <!-- Today's Services Table -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Today's Services</h5>
          <span class="badge bg-light text-dark">{{ todaysServices.length }} services</span>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in todaysServices" :key="service.id">
                  <td>{{ service.id }}</td>
                  <td>{{ service.customer_name }}</td>
                  <td>{{ service.service_name }}</td>
                  <td>{{ formatTime(service.service_time) }}</td>
                  <td>{{ service.location }}</td>
                  <td>
                    <button @click="acceptService(service.id)" class="btn btn-sm btn-success me-2">
                      Accept
                    </button>
                    <button @click="rejectService(service.id)" class="btn btn-sm btn-danger">
                      Reject
                    </button>
                  </td>
                </tr>
                <tr v-if="todaysServices.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    No services scheduled for today
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Closed Services Table -->
      <div class="card mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Completed Services</h5>
          <span class="badge bg-light text-dark">{{ completedServices.length }} services</span>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Rating</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in completedServices" :key="service.id">
                  <td>{{ service.id }}</td>
                  <td>{{ service.customer_name }}</td>
                  <td>{{ service.service_name }}</td>
                  <td>{{ formatDate(service.completed_date) }}</td>
                  <td>
                    <span v-for="i in 5" :key="i" 
                          :class="{'text-warning': i <= service.rating}">
                      ★
                    </span>
                    <span v-if="service.rating === null" class="text-muted">Not rated</span>
                  </td>
                  <td>
                    <span v-if="service.feedback">{{ service.feedback }}</span>
                    <span v-else class="text-muted">No feedback</span>
                  </td>
                </tr>
                <tr v-if="completedServices.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    No completed services yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Denied View -->
    <div v-if="!isAuthenticated && !loading" class="container text-center mt-5">
      <div class="alert alert-danger">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button class="btn btn-primary" @click="redirectToLogin">Go to Login</button>
      </div>
    </div>

     <!-- Profile Modal -->
    <div v-if="showProfileModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">My Profile</h5>
            <button type="button" class="btn-close" @click="showProfileModal = false"></button>
          </div>
          <div class="modal-body">
            <!-- Profile content goes here -->
            <p>Profile details and editing form would appear here</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showProfileModal = false">Close</button>
            <button type="button" class="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

  </div>
`,
    data() {
      return {
        loading: true,
        showProfileModal: false,
        todaysServices: [],
        completedServices: [],
        pendingRequests: 0
      };
    },
    computed: {
      isAuthenticated() {
        const user = this.$store.getters.currentUser;
        return this.$store.getters.isAuthenticated && 
              user?.role === 'professional';
      },
      currentProfessional() {
        return this.$store.getters.currentProfessional || 
              JSON.parse(localStorage.getItem('professional'));
      }
    },
    methods: {
      async fetchTodaysServices() {
        try {
          const response = await axios.get('/api/professional/today-services');
          this.todaysServices = response.data.map(service => ({
            ...service,
            service_time: new Date(service.service_time)
          }));
        } catch (error) {
          console.error("Error fetching today's services:", error);
        }
      },
      
      async fetchCompletedServices() {
        try {
          const response = await axios.get('/api/professional/completed-services');
          this.completedServices = response.data.map(service => ({
            ...service,
            completed_date: new Date(service.completed_date),
            service_date: new Date(service.service_date)
          }));
        } catch (error) {
          console.error('Error fetching completed services:', error);
        }
      },
      
      async fetchPendingRequestsCount() {
        try {
          const response = await axios.get('/api/professional/pending-requests-count');
          this.pendingRequests = response.data.count;
        } catch (error) {
          console.error('Error fetching pending requests count:', error);
        }
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
      },
      formatTime(timeString) {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      },
      async acceptService(serviceId) {
        try {
          await axios.put(`/api/professional/services/${serviceId}/accept`);
          this.fetchServices();
        } catch (error) {
          console.error("Error accepting service:", error);
        }
      },
      async rejectService(serviceId) {
        try {
          await axios.put(`/api/professional/services/${serviceId}/reject`);
          this.fetchServices();
        } catch (error) {
          console.error("Error rejecting service:", error);
        }
      },
      viewProfile() {
        this.showProfileModal = true;
      },
      checkAuthStatus() {
        if (!this.isAuthenticated) {
          this.$router.push('/login');
        }
        this.loading = false;
      },
      logout() {
        this.$store.dispatch('logout');
        this.$router.push('/login');
      },
      redirectToLogin() {
        this.$router.push('/login');
      }
    },
    async mounted() {
      await this.checkAuthStatus();
      if (this.isAuthenticated) {
        await this.fetchTodaysServices();
        await this.fetchCompletedServices();
        await this.fetchPendingRequestsCount();
      }
    }
})

export default ProfApp