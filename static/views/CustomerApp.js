const CustomerApp = Vue.component('CustomerApp', {
  template: `
    <div v-if="isAuthenticated">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-nav mb-4">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Customer Dashboard</a>
          <div class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <router-link to="/customer" class="nav-link">Home</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/customer/search" class="nav-link">Search</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/customer/profile" class="nav-link">Profile</router-link>
                </li>
              </ul>
            <div class="d-flex">
              <button class="btn btn-outline-warning" @click="logout">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container mt-4">
        <!-- Available Services Card -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Available Services</h4>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Base Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in availableServices" :key="service.id">
                    <td>{{ service.name }}</td>
                    <td>₹{{ service.price }}</td>
                    <td>
                      <button @click="bookService(service.id)" class="btn btn-sm btn-success">
                        <i class="bi bi-calendar-plus"></i> Book
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Service History Card -->
        <div class="card">
          <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 class="mb-0">Service History</h4>
            <button class="btn btn-light btn-sm" @click="fetchServiceHistory">
              <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Service Name</th>
                    <th>Professional</th>
                    <th>Contact</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="request in serviceHistory" :key="request.id">
                    <td>{{ request.id }}</td>
                    <td>{{ request.service_name }}</td>
                    <td>{{ request.professional_name || 'Not assigned' }}</td>
                    <td>
                      <span v-if="request.professional_contact">
                        <a :href="'tel:' + request.professional_contact">
                          <i class="bi bi-telephone"></i> {{ request.professional_contact }}
                        </a>
                      </span>
                      <span v-else class="text-muted">Not assigned</span>
                    </td>
                    <td>{{ formatDate(request.request_date) }}</td>
                    <td>
                      <span :class="getStatusBadgeClass(request.status)">
                        {{ request.status }}
                      </span>
                    </td>
                    <td>
                      <button v-if="request.status === 'Requested'" 
                              @click="cancelRequest(request.id)" 
                              class="btn btn-sm btn-danger">
                        Cancel
                      </button>
                      <button v-else-if="request.status === 'Closed'"
                              @click="rateService(request)"
                              class="btn btn-sm btn-primary">
                        Rate
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="serviceHistory.length === 0" class="text-center py-4">
                <p class="text-muted">No service requests found</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      availableServices: [],
      serviceHistory: [],
      loading: false
    };
  },
  computed: {
    isAuthenticated() {
      const user = this.$store.getters.currentUser;
      return this.$store.getters.isAuthenticated && user?.role === 'customer';
    },
    customerId() {
      return this.$store.getters.currentUser?.id;
    }
  },
  methods: {
    async fetchAvailableServices() {
      try {
        const response = await axios.get('/api/services');
        this.availableServices = response.data;
      } catch (error) {
        console.error("Failed to fetch services:", error);
        this.$toast.error("Failed to load available services");
      }
    },
    async fetchServiceHistory() {
      try {
        const response = await axios.get(`/api/customer/${this.customerId}/requests`, {
          headers: { 'Authorization': `Bearer ${this.$store.getters.authToken}` }
        });
        this.serviceHistory = response.data;
      } catch (error) {
        console.error("Failed to fetch service history:", error);
        this.$toast.error("Failed to load service history");
      }
    },
    async bookService(serviceId) {
      if (!confirm('Confirm booking this service?')) return;
      
      try {
        this.loading = true;
        const response = await axios.post(
          `/api/customer/${this.customerId}/requests`,
          { service_id: serviceId },
          { headers: { 'Authorization': `Bearer ${this.$store.getters.authToken}` } }
        );
        
        this.$toast.success('Service booked successfully!');
        await this.fetchServiceHistory();
      } catch (error) {
        console.error("Failed to book service:", error);
        this.$toast.error(error.response?.data?.message || 'Failed to book service');
      } finally {
        this.loading = false;
      }
    },
    async cancelRequest(requestId) {
      if (!confirm('Are you sure you want to cancel this request?')) return;
      
      try {
        await axios.put(
          `/api/customer/${this.customerId}/requests/${requestId}/cancel`,
          {},
          { headers: { 'Authorization': `Bearer ${this.$store.getters.authToken}` } }
        );
        
        this.$toast.success('Request cancelled successfully');
        await this.fetchServiceHistory();
      } catch (error) {
        console.error("Failed to cancel request:", error);
        this.$toast.error(error.response?.data?.message || 'Failed to cancel request');
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
    getStatusBadgeClass(status) {
      const classes = {
        'Requested': 'badge bg-info',
        'Accepted': 'badge bg-primary',
        'In Progress': 'badge bg-warning',
        'Closed': 'badge bg-success',
        'Cancelled': 'badge bg-secondary'
      };
      return classes[status] || 'badge bg-light text-dark';
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
    await this.fetchAvailableServices();
    await this.fetchServiceHistory();
    }
  }
});

export default CustomerApp;