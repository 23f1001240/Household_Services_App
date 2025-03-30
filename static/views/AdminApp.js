const AdminApp = Vue.component('AdminApp', {
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

        <div class="container-fluid" v-if="isAuthenticated">
          <!-- Services Table -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Services</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Service Name</th>
                      <th>Base Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="service in services" :key="service.id">
                      <td>{{ service.id }}</td>
                      <td>{{ service.name }}</td>
                      <td>{{ service.price }}</td>
                      <td>
                        <button @click="openEditService(service)" class="btn btn-sm btn-warning me-2">Edit</button>
                        <button @click="deleteService(service.id)" class="btn btn-sm btn-danger">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button @click="showAddServiceModal = true" class="btn btn-success mt-3">
                <i class="bi bi-plus-circle"></i> Add New Service
              </button>
            </div>
          </div>

          <!-- Professionals Table -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Professionals</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Experience</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Resume</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="professional in professionals" :key="professional.id">
                      <td>{{ professional.id }}</td>
                      <td>{{ professional.name }}</td>
                      <td>{{ professional.experience }} years</td>
                      <td>{{ professional.service_name }}</td>
                      <td>
                        <span :class="{
                            'badge bg-success': professional.status === 'Approved',
                            'badge bg-warning': professional.status === 'Pending',
                            'badge bg-danger': professional.status === 'Rejected'
                        }">
                            {{ professional.status || 'Pending' }} 
                        </span>
                      </td>
                      <td>
                        <button @click="viewResume(professional.id)" class="btn btn-sm btn-info">
                          View Resume
                        </button>
                      </td>
                        <td>
                          <!-- For Pending professionals - show all buttons -->
                          <template v-if="professional.status === 'Pending'">
                              <button @click="approveProfessional(professional.id)" class="btn btn-sm btn-success me-2">
                                  Approve
                              </button>
                              <button @click="rejectProfessional(professional.id)" class="btn btn-sm btn-warning me-2">
                                  Reject
                              </button>
                              <button @click="deleteProfessional(professional.id)" class="btn btn-sm btn-danger">
                                  Delete
                              </button>
                          </template>

                          <!-- For Approved professionals -->
                          <template v-else-if="professional.status === 'Approved'">
                              <button @click="rejectProfessional(professional.id)" class="btn btn-sm btn-warning me-2">
                                  Reject
                              </button>
                              <button @click="deleteProfessional(professional.id)" class="btn btn-sm btn-danger">
                                  Delete
                              </button>
                          </template>

                          <!-- For Rejected professionals -->
                          <template v-else-if="professional.status === 'Rejected'">
                              <button @click="approveProfessional(professional.id)" class="btn btn-sm btn-success me-2">
                                  Approve
                              </button>
                              <button @click="deleteProfessional(professional.id)" class="btn btn-sm btn-danger">
                                  Delete
                              </button>
                          </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Service Requests Table -->
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Service Requests</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Assigned Professional</th>
                      <th>Request Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="request in serviceRequests" :key="request.id">
                      <td>{{ request.id }}</td>
                      <td>{{ request.customer_name }}</td>
                      <td>{{ request.provider_name || 'Not assigned' }}</td>
                      <td>{{ new Date(request.date_of_request).toLocaleDateString() }}</td>
                      <td>
                        <span :class="{
                          'badge bg-info': request.status === 'Requested',
                          'badge bg-primary': request.status === 'Accepted',
                          'badge bg-success': request.status === 'Closed'
                        }">
                          {{ request.status }}
                        </span>
                      </td>
                      <td>
                        <button v-if="request.status === 'Requested'" 
                                @click="updateRequestStatus(request.id, 'Accepted')" 
                                class="btn btn-sm btn-primary me-2">
                          Accept
                        </button>
                        <button v-if="request.status === 'Accepted'" 
                                @click="updateRequestStatus(request.id, 'Closed')" 
                                class="btn btn-sm btn-success">
                          Close
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Service Modal -->
        <div v-if="showAddServiceModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Add New Service</h5>
                <button type="button" class="btn-close" @click="showAddServiceModal = false"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="addNewService">
                  <div class="mb-3">
                    <label for="serviceName" class="form-label">Service Name:</label>
                    <input type="text" class="form-control" id="serviceName" v-model="newService.name" required>
                  </div>
                  <div class="mb-3">
                    <label for="servicePrice" class="form-label">Base Price (₹):</label>
                    <input type="number" class="form-control" id="servicePrice" v-model="newService.price" min="0" step="0.01" required>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showAddServiceModal = false">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Service</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Service Modal -->
        <div v-if="showEditServiceModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Service</h5>
                <button type="button" class="btn-close" @click="showEditServiceModal = false"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="updateService">
                  <div class="mb-3">
                    <label class="form-label">Service Name:</label>
                    <input type="text" class="form-control" v-model="editingService.name" readonly>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Base Price (₹):</label>
                    <input type="number" class="form-control" v-model="editingService.price" min="0" step="0.01" required>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="showEditServiceModal = false">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- Resume Modal -->
        <div v-if="resumeModalVisible" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5)">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Professional Resume</h5>
                <button type="button" class="btn-close" @click="resumeModalVisible = false"></button>
              </div>
              <div class="modal-body">
                <div v-if="resumeType === 'pdf'">
                  <embed :src="resumeUrl" type="application/pdf" width="100%" height="500px" />
                </div>
                <div v-else-if="resumeType === 'text'">
                  <pre>{{ resumeContent }}</pre>
                </div>
                <div v-else>
                  <p>Resume file type not supported.</p>
                </div>
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
      </div>
    `,
    data() {
      return {
        loading: true,
        services: [],
        professionals: [],
        serviceRequests: [],
        resumeModalVisible: false,
        resumeUrl: '',
        resumeContent: '',
        resumeType: '',
        showAddServiceModal: false,
        showEditServiceModal: false,
        newService: {
          name: '',
          price: 0
        },
        editingService: {
          id: null,
          name: '',
          price: 0
        }
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
      async addNewService() {
        try {
          const response = await axios.post('/api/admin/services', this.newService);
          this.services.push(response.data);
          this.showAddServiceModal = false;
          this.newService = { name: '', price: 0 };
        } catch (error) {
          console.error('Error adding service:', error);
        }
      },
      openEditService(service) {
        this.editingService = { ...service };
        this.showEditServiceModal = true;
      },
      async updateService() {
        try {
          const response = await axios.put(`/api/admin/services/${this.editingService.id}`, {
            price: this.editingService.price
          });
          
          await this.fetchServices();
          this.showEditServiceModal = false;
          
          alert('Service updated successfully!');
        } catch (error) {
          console.error('Error updating service:', error);
          alert('Failed to update service. Please try again.');
        }
      },
      async deleteService(id) {
        if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
          return;
        }
        
        try {
          await axios.delete(`/api/admin/services/${id}`);
          await this.fetchServices();
          
          alert('Service deleted successfully!');
        } catch (error) {
          console.error('Error deleting service:', error);
          alert('Failed to delete service. Please try again.');
        }
      },
      async viewResume(professionalId) {
        try {
            const response = await axios.get(`/api/professional/${professionalId}/resume`, {
                responseType: 'blob'
            });
    
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            this.resumeUrl = URL.createObjectURL(file);
            this.resumeType = response.headers['content-type'].includes('pdf') ? 'pdf' : 'text';
    
            this.resumeModalVisible = true;
        } catch (error) {
            console.error('Error fetching resume:', error);
            alert('Failed to load resume.');
        }
    },    
      async approveProfessional(id) {
        try {
            if (!confirm('Are you sure you want to approve this professional?')) return;
            
            const response = await axios.put(`/api/admin/professionals/${id}/approve`);
            
            this.professionals = this.professionals.map(p => 
                p.id === id ? { ...p, status: 'Approved' } : p
            );
            
            alert(response.data.message);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 
                           (error.response?.status === 400 ?
                            "Cannot change status (already in target state)" :
                            "Failed to update status");
            alert(errorMsg);
        }
    },
    async rejectProfessional(id) {
        try {
            if (!confirm('Are you sure you want to reject this professional?')) return;
            
            const response = await axios.put(`/api/admin/professionals/${id}/reject`);
            
            this.professionals = this.professionals.map(p => 
                p.id === id ? { ...p, status: 'Rejected' } : p
            );
            
            alert(response.data.message);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 
                           (error.response?.status === 400 ?
                            "Cannot change status (already in target state)" :
                            "Failed to update status");
            alert(errorMsg);
        }
    },
    async deleteProfessional(id) {
        try {
            if (!confirm('WARNING: This will permanently delete the professional. Continue?')) return;
            
            const response = await axios.delete(`/api/admin/professionals/${id}`);
            await this.fetchProfessionals();
            
            alert(response.data.message || 'Professional deleted successfully');
        } catch (error) {
            console.error('Deletion failed:', error);
            alert(error.response?.data?.error || 'Failed to delete professional');
        }
    },
    async updateRequestStatus(id, newStatus) {
      try {
          if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) {
              return;
          }
          const response = await axios.put(`/api/admin/service-requests/${id}`, {
              status: newStatus
          });
          this.serviceRequests = this.serviceRequests.map(request => 
              request.id === id ? { ...request, status: newStatus } : request
          );
          alert(`Status updated to ${newStatus}`);
      } catch (error) {
          console.error('Error updating status:', error);
          alert(error.response?.data?.error || 'Failed to update status');
      }
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
        await this.fetchServices();
        await this.fetchProfessionals();
        await this.fetchServiceRequests();
      }
    }
});

export default AdminApp;