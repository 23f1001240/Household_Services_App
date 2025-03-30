const ProfSearch = Vue.component('ProfSearch', {
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
              <button class="btn btn-outline-warning" @click="logout">Logout</button>
            </div>
          </div>
        </nav>

        <!-- Search Functionality -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5>Search Customers</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-8">
                <input type="text" class="form-control" 
                       v-model="searchQuery" 
                       placeholder="Enter name, pincode, or phone number..."
                       @keyup.enter="performSearch">
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
            <small class="text-muted">Showing results for "{{ searchQuery }}"</small>
          </div>
  
          <div class="card-body p-0">
            <table class="table table-striped mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Pincode</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in searchResults" :key="customer.id">
                  <td>{{ customer.id }}</td>
                  <td>{{ customer.name }}</td>
                  <td>{{ customer.email }}</td>
                  <td>{{ customer.phone_number }}</td>
                  <td>{{ customer.pincode }}</td>
                  <td>{{ customer.address }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    data() {
        return {
          searchQuery: '',
          searchResults: []
        };
    },
    methods: {
        async performSearch() {
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                return;
            }
            
            try {
                const response = await axios.get('/api/professional/search', {
                    params: { query: this.searchQuery }
                });

                this.searchResults = response.data;
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
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/login');
        }
    }
});

export default ProfSearch;
