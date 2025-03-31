const CustSearch = Vue.component('CustSearch', {
    template: `
      <div>
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

        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h5>Search Services</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-8">
                <input type="text" class="form-control"
                       v-model="searchQuery"
                       placeholder="Enter service name..."
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
          </div>
        </div>
        <div class="alert alert-warning mt-3" v-if="searchResults.length === 0 && searchQuery.trim() !== ''">
          No services found matching your search criteria.
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
                const response = await axios.get('/api/customer/search', {
                    params: { query: this.searchQuery },
                    headers: { 'Authorization': `Bearer ${this.$store.getters.authToken}` }
                });

                this.searchResults = response.data;
            } catch (error) {
                console.error('Service search failed:', error);
                this.searchResults = [];
                this.$toast.error('Search failed. Please try again.');
            }
        },
        clearSearch() {
            this.searchQuery = '';
            this.searchResults = [];
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
    }
});

export default CustSearch;