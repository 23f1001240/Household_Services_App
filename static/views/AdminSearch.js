const AdminSearch = Vue.component('AdminSearch', {
    template: `
      <div>
        <!-- Bootstrap Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-nav mb-4">
          <div class="container-fluid">
            <a class="navbar-brand" href="#">Admin Dashboard</a>
            <div class="collapse navbar-collapse">
              <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <router-link to="/admin" class="nav-link">Home</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/admin/search" class="nav-link">Search</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/admin/summary" class="nav-link">Summary</router-link>
                </li>
              </ul>
              <button class="btn btn-outline-warning" @click="logout">Logout</button>
            </div>
          </div>
        </nav>

        <!-- Search Functionality -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5>Search</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-8">
                <input type="text" class="form-control" 
                       v-model="searchQuery" 
                       placeholder="Enter name, email, phone number..."
                       @keyup.enter="performSearch">
              </div>
              <div class="col-md-4">
                <select class="form-select" v-model="searchCategory">
                  <option value="services">Services</option>
                  <option value="customers">Customers</option>
                  <option value="professionals">Professionals</option>
                  <option value="requests">Service Requests</option>
                </select>
              </div>
              <div class="col-12">
                <button class="btn btn-primary" @click="performSearch">
                  <i class="fas fa-search me-2"></i>Search
                </button>
                <button class="btn btn-outline-secondary ms-2" @click="clearSearch">
                  Clear Results
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Search Results -->
        <div class="card" v-if="searchResults.length > 0">
        <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Search Results ({{ searchResults.length }})</h5>
            <small class="text-muted">Showing results for "{{ searchQuery }}" in {{ searchCategory }}</small>
        </div>

        <div class="card-body p-0">

            <!-- Services Table -->
            <table v-if="searchCategory === 'services'" class="table table-striped mb-0">
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="service in searchResults" :key="service.id">
                <td>{{ service.id }}</td>
                <td>{{ service.name }}</td>
                <td>{{ service.price }}</td>
                </tr>
            </tbody>
            </table>

            <!-- Customers Table -->
            <table v-if="searchCategory === 'customers'" class="table table-striped mb-0">
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="customer in searchResults" :key="customer.id">
                <td>{{ customer.id }}</td>
                <td>{{ customer.name }}</td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.phone_number }}</td>
                </tr>
            </tbody>
            </table>

            <!-- Professionals Table -->
            <table v-if="searchCategory === 'professionals'" class="table table-striped mb-0">
            <thead>
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Service ID</th>
                <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="professional in searchResults" :key="professional.id">
                <td>{{ professional.id }}</td>
                <td>{{ professional.name }}</td>
                <td>{{ professional.email }}</td>
                <td>{{ professional.service_id }}</td>
                <td>{{ professional.status }}</td>
                </tr>
            </tbody>
            </table>

            <!-- Requests Table -->
            <table v-if="searchCategory === 'requests'" class="table table-striped mb-0">
            <thead>
                <tr>
                <th>ID</th>
                <th>Customer ID</th>
                <th>Professional ID</th>
                <th>Service ID</th>
                <th>Date of Request</th>
                <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="request in searchResults" :key="request.id">
                <td>{{ request.id }}</td>
                <td>{{ request.customer_id }}</td>
                <td>{{ request.professional_id }}</td>
                <td>{{ request.service_id }}</td>
                <td>{{ request.date_of_request }}</td>
                <td>{{ request.status }}</td>
                </tr>
            </tbody>
            </table>

        </div>
        </div>
      </div>
    `,
    data() {
        return {
          loading: true,
          services: [],
          customers: [],
          professionals: [],
          serviceRequests: [],
          searchQuery: '',
          searchCategory: 'services',
          searchResults: []
        };
      },
      computed: {
        isAuthenticated() {
          return this.$store.getters.isAuthenticated && this.$store.getters.currentUser?.role === 'admin';
        },
        userName() {
          return this.$store.getters.currentUser?.name || 'Admin';
        }
      },
    methods: {
        async fetchCustomers() {
            try {
              const response = await axios.get('/api/admin/customers');
              this.customers = response.data;
            } catch (error) {
              console.error('Error fetching customers:', error);
            }
          },          
        async fetchServices() {
            try {
              const response = await axios.get('/api/admin/services');
              this.services = response.data;
            } catch (error) {
              console.error('Error fetching services:', error);
            }
          },
          async fetchProfessionals() {
            try {
              const response = await axios.get('/api/admin/professionals');
              this.professionals = response.data.map(prof => {
                let status = prof.status;
                
                if (prof.status === true) {
                  status = 'Approved';
                } else if (prof.status === false) {
                  status = 'Rejected';
                } else if (prof.status === null || prof.status === undefined) {
                  status = 'Pending';
                }
                
                return {
                  ...prof,
                  status: status
                };
              });
            } catch (error) {
              console.error('Error fetching professionals:', error);
              alert('Failed to load professionals data');
            }
          },
          async fetchServiceRequests() {
            try {
                const response = await axios.get('/api/admin/service-requests');
                this.serviceRequests = response.data.map(request => ({
                    ...request,
                    date_of_request: new Date(request.date_of_request)
                }));
            } catch (error) {
                console.error('Error fetching service requests:', error);
                alert('Failed to load service requests');
            }
          },
        async performSearch() {
            try {
              if (!this.searchQuery.trim()) {
                this.searchResults = [];
                return;
              }
              
              const response = await axios.get('/api/admin/search', {
                params: {
                  query: this.searchQuery,
                  category: this.searchCategory
                }
              });
              
              this.searchResults = response.data.map(item => {
                if (this.searchCategory === 'professionals') {
                  return {
                    ...item,
                    status: item.status === true || item.status === 'Approved' ? 'Approved' :
                           item.status === false || item.status === 'Rejected' ? 'Rejected' : 'Pending'
                  };
                }
                return item;
              });
              
            } catch (error) {
              console.error('Search failed:', error);
              this.searchResults = [];
              alert('Search failed. Please try again.');
            }
          },
          
          clearSearch() {
            this.searchQuery = '';
            this.searchResults = [];
          },
      getServiceName(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        return service ? service.name : 'Unknown';
      },
      getCustomerName(customerId) {
        const customer = this.customers?.find(c => c.id === customerId);
        return customer ? customer.name : 'Unknown';
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
      },
      logout() {
        this.$store.dispatch('logout');
        this.$router.push('/login');
      },
      redirectToLogin() {
        this.$router.push('/login');
      }
    },
    async created() {
      await this.fetchServices();
      await this.fetchCustomers();
      await this.fetchProfessionals();
      await this.fetchServiceRequests();
    }
  });

  export default AdminSearch;