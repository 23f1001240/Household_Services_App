const CustomerApp = Vue.component('CustomerApp', {
  template: `
    <div v-if="isAuthenticated">
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

      <div class="container mt-4">
          <!-- Router View for Customer Pages -->
          <router-view></router-view>
      
      <!-- Profile Page -->
            <div v-if="$route.path === '/customer/profile'">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4>My Profile</h4>
                    </div>
                    <div class="card-body">
                        <form @submit.prevent="updateProfile">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="name" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="name" v-model="customer.name" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" v-model="customer.email" required>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="phone" class="form-label">Phone Number</label>
                                    <input type="tel" class="form-control" id="phone" v-model="customer.phone_number">
                                </div>
                                <div class="col-md-6">
                                    <label for="address" class="form-label">Address</label>
                                    <input type="text" class="form-control" id="address" v-model="customer.address">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <label for="pincode" class="form-label">Pincode</label>
                                    <input type="text" class="form-control" id="pincode" v-model="customer.pincode">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">Update Profile</button>
                            <button type="button" class="btn btn-secondary ms-2" @click="$router.push('/customer')">Cancel</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Service History Table -->
            <div v-if="$route.path === '/customer'">
                <div class="card">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h4 class="mb-0">Service History</h4>
                        <button class="btn btn-light btn-sm" @click="refreshServiceHistory">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Service</th>
                                        <th>Professional</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Rating</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="request in serviceHistory" :key="request.id">
                                        <td>{{ request.id }}</td>
                                        <td>{{ request.service.name }}</td>
                                        <td>{{ request.professional ? request.professional.name : 'Not assigned' }}</td>
                                        <td>{{ formatDate(request.date_of_request) }}</td>
                                        <td>
                                            <span :class="{
                                                'badge bg-success': request.status === 'Completed',
                                                'badge bg-warning': request.status === 'In Progress',
                                                'badge bg-info': request.status === 'Pending',
                                                'badge bg-danger': request.status === 'Cancelled'
                                            }">
                                                {{ request.status }}
                                            </span>
                                        </td>
                                        <td>
                                            <span v-if="request.rating">
                                                <i v-for="n in 5" :key="n" 
                                                   :class="n <= request.rating ? 'fas fa-star text-warning' : 'far fa-star text-warning'"></i>
                                            </span>
                                            <span v-else class="text-muted">Not rated</span>
                                        </td>
                                        <td>
                                            <button v-if="request.status === 'Completed' && !request.rating" 
                                                    @click="openRatingModal(request)" 
                                                    class="btn btn-sm btn-primary me-2">
                                                Rate
                                            </button>
                                            <button v-if="request.status === 'Pending'"
                                                    @click="cancelRequest(request.id)"
                                                    class="btn btn-sm btn-danger">
                                                Cancel
                                            </button>
                                            <button v-if="request.status === 'In Progress' && request.professional"
                                                    @click="contactProfessional(request.professional.phone_number)"
                                                    class="btn btn-sm btn-info">
                                                <i class="fas fa-phone"></i> Contact
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div v-if="serviceHistory.length === 0" class="text-center py-4">
                            <p class="text-muted">No service history found</p>
                            <router-link to="/customer/search" class="btn btn-primary">
                                <i class="fas fa-search"></i> Find Services
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Rating Modal -->
        <div class="modal fade" id="ratingModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rate Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>Service: {{ currentRating.service.name }}</h6>
                        <p>Professional: {{ currentRating.professional ? currentRating.professional.name : 'Not assigned' }}</p>
                        <p>Date: {{ formatDate(currentRating.date_of_request) }}</p>
                        
                        <div class="my-4">
                            <h6>Your Rating:</h6>
                            <div class="rating-stars">
                                <span v-for="n in 5" :key="n" @click="currentRating.newRating = n" 
                                      style="cursor: pointer; font-size: 2rem;">
                                    <i :class="n <= currentRating.newRating ? 'fas fa-star text-warning' : 'far fa-star text-warning'"></i>
                                </span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="remarks" class="form-label">Comments (optional):</label>
                            <textarea class="form-control" id="remarks" v-model="currentRating.remarks" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="submitRating">Submit Rating</button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div v-else-if="authChecked" class="container text-center mt-5">
          <div class="alert alert-danger">
              <h2>Access Denied</h2>
              <p>You don't have permission to view this page.</p>
              <button class="btn btn-primary" @click="redirectToLogin">Go to Login</button>
          </div>
      </div>

    </div>
  `,
  data() {
        return {
            loading: true,
            authChecked: false,
            customer: {
                id: null,
                name: '',
                email: '',
                phone_number: '',
                address: '',
                pincode: ''
            },
            serviceHistory: [],
            currentRating: {
                id: null,
                service: { name: '' },
                professional: null,
                date_of_request: '',
                newRating: 0,
                remarks: ''
            }
        };
    },
    computed: {
        isAuthenticated() {
            const user = this.$store.getters.currentUser;
            return this.$store.getters.isAuthenticated && 
                   user?.role === 'customer';
        },
        customerId() {
            return this.$store.getters.currentUser?.id;
        }
    },
    async created() {
        await this.checkAuthStatus();
        if (this.isAuthenticated) {
            await this.fetchCustomerProfile();
            await this.fetchServiceHistory();
        }
    },
    methods: {
        async checkAuthStatus() {
            try {
                await this.$store.dispatch('checkAuth');
                if (!this.isAuthenticated) {
                    this.$router.push('/login');
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                this.$router.push('/login');
            } finally {
                this.loading = false;
                this.authChecked = true;
            }
        },
        
        async fetchCustomerProfile() {
            try {
                const response = await axios.get(`/api/customer/${this.customerId}`);
                this.customer = response.data;
            } catch (error) {
                console.error("Failed to fetch customer profile:", error);
                alert("Failed to load profile data");
            }
        },
        
        async fetchServiceHistory() {
            try {
                const response = await axios.get(`/api/customer/${this.customerId}/service-requests`, {
                    params: {
                        include: 'service,professional'
                    }
                });
                this.serviceHistory = response.data;
            } catch (error) {
                console.error("Failed to fetch service history:", error);
                alert("Failed to load service history");
            }
        },
        
        async refreshServiceHistory() {
            this.loading = true;
            await this.fetchServiceHistory();
            this.loading = false;
        },
        
        async updateProfile() {
            try {
                await axios.put(`/api/customer/${this.customerId}`, {
                    name: this.customer.name,
                    email: this.customer.email,
                    phone_number: this.customer.phone_number,
                    address: this.customer.address,
                    pincode: this.customer.pincode
                });
                alert("Profile updated successfully");
                this.$store.dispatch('updateUser', this.customer);
            } catch (error) {
                console.error("Failed to update profile:", error);
                alert("Failed to update profile");
            }
        },
        
        viewProfile() {
            this.$router.push('/customer/profile');
        },
        
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/login');
        },
        
        redirectToLogin() {
            this.$router.push('/login');
        },
        
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        openRatingModal(request) {
            this.currentRating = {
                id: request.id,
                service: request.service,
                professional: request.professional,
                date_of_request: request.date_of_request,
                newRating: 0,
                remarks: ''
            };
            const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
            modal.show();
        },
        
        async submitRating() {
            try {
                await axios.post(`/api/service-requests/${this.currentRating.id}/rate`, {
                    rating: this.currentRating.newRating,
                    remarks: this.currentRating.remarks
                });
                
                // Update local state
                const index = this.serviceHistory.findIndex(r => r.id === this.currentRating.id);
                if (index !== -1) {
                    this.serviceHistory[index].rating = this.currentRating.newRating;
                }
                
                alert("Thank you for your rating!");
                const modal = bootstrap.Modal.getInstance(document.getElementById('ratingModal'));
                modal.hide();
            } catch (error) {
                console.error("Failed to submit rating:", error);
                alert("Failed to submit rating");
            }
        },
        
        async cancelRequest(requestId) {
            if (!confirm("Are you sure you want to cancel this service request?")) {
                return;
            }
            
            try {
                await axios.put(`/api/service-requests/${requestId}/cancel`);
                await this.fetchServiceHistory();
                alert("Service request cancelled successfully");
            } catch (error) {
                console.error("Failed to cancel request:", error);
                alert("Failed to cancel service request");
            }
        },
        
        contactProfessional(phoneNumber) {
            if (confirm(`Call professional at ${phoneNumber}?`)) {
                window.location.href = `tel:${phoneNumber}`;
            }
        }
    }
});

export default CustomerApp;