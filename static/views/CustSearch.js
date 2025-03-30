const CustSearch = Vue.component('CustSearch', {
    template: `
      <div>
        <!-- Navbar -->
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

        <div class="container-fluid">
          <!-- Search Card -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5>Search Household Services</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-12">
                  <div class="input-group">
                    <input type="text" class="form-control" 
                           v-model="searchQuery" 
                           placeholder="Search by service name"
                           @keyup.enter="performSearch">
                    <button class="btn btn-primary" @click="performSearch">
                      <i class="fas fa-search"></i> Search
                    </button>
                    <button class="btn btn-outline-secondary" @click="clearSearch">
                      <i class="fas fa-times"></i> Clear
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Search Results -->
              <div v-if="searchResults.length > 0">
                <h5>Search Results</h5>
                <div class="row">
                  <div class="col-md-6 col-lg-4 mb-3" v-for="service in searchResults" :key="service.id">
                    <div class="card h-100">
                      <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text text-muted">{{ service.description }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="badge bg-info">
                            {{ service.professionals_count }} available
                          </span>
                          <h5 class="text-success mb-0">₹{{ service.price.toFixed(2) }}</h5>
                        </div>
                      </div>
                      <div class="card-footer bg-transparent">
                        <button class="btn btn-primary w-100" @click="bookService(service)">
                          <i class="fas fa-calendar-check me-2"></i>Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="searchPerformed" class="text-center py-4">
                <p class="text-muted">No services found matching your search</p>
              </div>
            </div>
          </div>

          <!-- Service Suggestions Card -->
          <div class="card">
            <div class="card-header bg-success text-white">
              <h5>Popular Services You Might Like</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 col-lg-3 mb-3" v-for="service in suggestedServices" :key="service.id">
                  <div class="card h-100">
                    <div class="card-body">
                      <h5 class="card-title">{{ service.name }}</h5>
                      <p class="card-text text-muted">{{ service.description }}</p>
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <span class="text-warning">
                            <i v-for="n in 5" :key="n" 
                               :class="n <= service.avg_rating ? 'fas fa-star' : 'far fa-star'"></i>
                          </span>
                          <small class="text-muted ms-2">({{ service.reviews }} reviews)</small>
                        </div>
                        <h5 class="text-success mb-0">₹{{ service.price }}</h5>
                      </div>
                    </div>
                    <div class="card-footer bg-transparent">
                      <button class="btn btn-success w-100" @click="bookService(service)">
                        <i class="fas fa-calendar-check me-2"></i>Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking Modal -->
        <div class="modal fade" id="bookingModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Book Service</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div v-if="selectedService">
                  <h6>{{ selectedService.name }}</h6>
                  <p>Price: ₹{{ selectedService.price.toFixed(2) }}</p>
                  <div class="mb-3">
                    <label for="serviceDate" class="form-label">Preferred Date</label>
                    <input type="date" class="form-control" id="serviceDate" v-model="bookingDate" required>
                  </div>
                  <div class="mb-3">
                    <label for="remarks" class="form-label">Special Instructions (optional)</label>
                    <textarea class="form-control" id="remarks" v-model="bookingRemarks" rows="3"></textarea>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" @click="confirmBooking">Confirm Booking</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
        return {
            searchQuery: '',
            searchResults: [],
            suggestedServices: [
                {
                    id: 1,
                    name: 'Plumbing',
                    price: 50.0,
                    description: 'Professional plumbing services',
                    avg_rating: 4.5,
                    reviews: 42,
                    professionals_count: 15
                },
                {
                    id: 2,
                    name: 'Electrical',
                    price: 70.0,
                    description: 'Certified electricians',
                    avg_rating: 4.2,
                    reviews: 35,
                    professionals_count: 12
                },
                {
                    id: 3,
                    name: 'Cleaning',
                    price: 30.0,
                    description: 'Thorough cleaning services',
                    avg_rating: 4.7,
                    reviews: 58,
                    professionals_count: 20
                },
                {
                    id: 4,
                    name: 'Gardening',
                    price: 40.0,
                    description: 'Landscaping and garden maintenance',
                    avg_rating: 4.3,
                    reviews: 27,
                    professionals_count: 8
                }
            ],
            searchPerformed: false,
            selectedService: null,
            bookingDate: '',
            bookingRemarks: ''
        };
    },
    methods: {
        async performSearch() {
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                this.searchPerformed = false;
                return;
            }
            
            try {
                const response = await axios.get('/api/customer/search', {
                    headers: {
                        'Authorization': `Bearer ${this.$store.getters.accessToken}`
                    },
                    params: {
                        query: this.searchQuery
                    }
                });
                
                this.searchResults = response.data;
                this.searchPerformed = true;
            } catch (error) {
                console.error('Search failed:', error);
                this.searchResults = [];
                this.searchPerformed = true;
                
                if (error.response?.status === 401) {
                    await this.$store.dispatch('refreshToken');
                    this.performSearch();
                } else {
                    alert(error.response?.data?.message || 'Search failed. Please try again.');
                }
            }
        },
        
        clearSearch() {
            this.searchQuery = '';
            this.searchResults = [];
            this.searchPerformed = false;
        },
        
        bookService(service) {
            this.selectedService = service;
            this.bookingDate = '';
            this.bookingRemarks = '';
            const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
            modal.show();
        },
        
        async confirmBooking() {
            if (!this.bookingDate) {
                alert('Please select a date for the service');
                return;
            }
            
            try {
                const response = await axios.post('/api/service-requests', {
                    service_id: this.selectedService.id,
                    requested_date: this.bookingDate,
                    remarks: this.bookingRemarks
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.$store.getters.accessToken}`
                    }
                });
                
                alert('Service booked successfully!');
                const modal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
                modal.hide();
            } catch (error) {
                console.error('Booking failed:', error);
                
                if (error.response?.status === 401) {
                    await this.$store.dispatch('refreshToken');
                    this.confirmBooking();
                } else {
                    alert(error.response?.data?.message || 'Failed to book service. Please try again.');
                }
            }
        },
        
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/login');
        }
    }
});

export default CustSearch;