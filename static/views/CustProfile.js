const CustProfile = Vue.component('CustProfile', {
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
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h4 class="mb-0">My Profile</h4>
                                <button class="btn btn-light btn-sm" @click="toggleEditMode">
                                    <i class="bi" :class="editMode ? 'bi-x-lg' : 'bi-pencil'"></i>
                                    {{ editMode ? 'Cancel' : 'Edit Profile' }}
                                </button>
                            </div>
                            <div class="card-body">
                                <div v-if="!editMode">
                                    <div class="mb-3 row">
                                        <label class="col-sm-3 col-form-label">Name:</label>
                                        <div class="col-sm-9">
                                            <p class="form-control-plaintext">{{ customer.name }}</p>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label class="col-sm-3 col-form-label">Email:</label>
                                        <div class="col-sm-9">
                                            <p class="form-control-plaintext">{{ customer.email }}</p>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label class="col-sm-3 col-form-label">Phone:</label>
                                        <div class="col-sm-9">
                                            <p class="form-control-plaintext">{{ customer.phone_number || 'Not provided' }}</p>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label class="col-sm-3 col-form-label">Address:</label>
                                        <div class="col-sm-9">
                                            <p class="form-control-plaintext">{{ customer.address || 'Not provided' }}</p>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label class="col-sm-3 col-form-label">Pincode:</label>
                                        <div class="col-sm-9">
                                            <p class="form-control-plaintext">{{ customer.pincode || 'Not provided' }}</p>
                                        </div>
                                    </div>
                                </div>

                                <form v-else @submit.prevent="saveProfile">
                                    <div class="mb-3 row">
                                        <label for="name" class="col-sm-3 col-form-label">Name:</label>
                                        <div class="col-sm-9">
                                            <input type="text" class="form-control" id="name"
                                                   v-model="customer.name">
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="email" class="col-sm-3 col-form-label">Email:</label>
                                        <div class="col-sm-9">
                                            <input type="email" class="form-control" id="email"
                                                   v-model="customer.email">
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="phone" class="col-sm-3 col-form-label">Phone:</label>
                                        <div class="col-sm-9">
                                            <input type="tel" class="form-control" id="phone"
                                                   v-model="customer.phone_number"
                                                   placeholder="Enter phone number">
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="address" class="col-sm-3 col-form-label">Address:</label>
                                        <div class="col-sm-9">
                                            <textarea class="form-control" id="address" rows="3"
                                                      v-model="customer.address"
                                                      placeholder="Enter your address"></textarea>
                                        </div>
                                    </div>
                                    <div class="mb-3 row">
                                        <label for="pincode" class="col-sm-3 col-form-label">Pincode:</label>
                                        <div class="col-sm-9">
                                            <input type="text" class="form-control" id="pincode"
                                                   v-model="customer.pincode"
                                                   placeholder="6-digit pincode" maxlength="6">
                                        </div>
                                    </div>

                                    <div class="border-top pt-3 mt-3">
                                        <h5>Change Password</h5>
                                        <div class="mb-3 row">
                                            <label for="currentPassword" class="col-sm-3 col-form-label">Current Password:</label>
                                            <div class="col-sm-9">
                                                <input type="password" class="form-control" id="currentPassword"
                                                       v-model="passwordFields.current_password">
                                            </div>
                                        </div>
                                        <div class="mb-3 row">
                                            <label for="newPassword" class="col-sm-3 col-form-label">New Password:</label>
                                            <div class="col-sm-9">
                                                <input type="password" class="form-control" id="newPassword"
                                                       v-model="passwordFields.new_password">
                                            </div>
                                        </div>
                                        <div class="mb-3 row">
                                            <label for="confirmPassword" class="col-sm-3 col-form-label">Confirm Password:</label>
                                            <div class="col-sm-9">
                                                <input type="password" class="form-control" id="confirmPassword"
                                                       v-model="passwordFields.confirm_password">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                        <button type="button" class="btn btn-secondary me-md-2"
                                                @click="toggleEditMode">Cancel</button>
                                        <button type="submit" class="btn btn-primary"
                                                :disabled="isSaving">
                                            <span v-if="isSaving" class="spinner-border spinner-border-sm"
                                                  role="status" aria-hidden="true"></span>
                                            {{ isSaving ? 'Saving...' : 'Save Changes' }}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            customer: {
                id: null,
                name: '',
                email: '',
                phone_number: '',
                address: '',
                pincode: ''
            },
            originalData: {},
            passwordFields: {
                current_password: '',
                new_password: '',
                confirm_password: ''
            },
            editMode: false,
            isSaving: false
        };
    },
    computed: {
        isAuthenticated() {
            return this.$store.getters.isAuthenticated &&
                   this.$store.getters.currentUser?.role === 'customer';
        },
        customerId() {
            return this.$store.getters.currentUser?.id;
        }
    },
    methods: {
        async fetchCustomerProfile() {
            try {
                const response = await axios.get(`/api/customer/${this.customerId}`, {
                    headers: { 'Authorization': `Bearer ${this.$store.getters.authToken}` }
                });
                this.customer = response.data;
                // Save original data for cancel operation
                this.originalData = JSON.parse(JSON.stringify(response.data));
            } catch (error) {
                console.error("Failed to fetch customer profile:", error);
                this.$toast.error("Failed to load profile information");
            }
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
            if (!this.editMode) {
                // Reset to original data when canceling edit
                this.customer = JSON.parse(JSON.stringify(this.originalData));
                this.passwordFields = {
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                };
            }
        },
        async saveProfile() {
            // Validate password change if any password field is filled
            if (this.passwordFields.current_password ||
                this.passwordFields.new_password ||
                this.passwordFields.confirm_password) {

                if (!this.passwordFields.current_password) {
                    this.$toast.error("Please enter your current password");
                    return;
                }

                if (this.passwordFields.new_password !== this.passwordFields.confirm_password) {
                    this.$toast.error("New passwords don't match");
                    return;
                }

                if (this.passwordFields.new_password.length < 6) {
                    this.$toast.error("Password must be at least 6 characters");
                    return;
                }
            }

            this.isSaving = true;
            try {
                const payload = {
                    name: this.customer.name, 
                    email: this.customer.email,
                    phone_number: this.customer.phone_number,
                    address: this.customer.address,
                    pincode: this.customer.pincode
                };

                if (this.passwordFields.current_password) {
                    payload.current_password = this.passwordFields.current_password;
                    payload.new_password = this.passwordFields.new_password;
                }

                await axios.put(`/api/customer/${this.customerId}`, payload, {
                    headers: { 'Authorization': `Bearer ${this.$store.getters.authToken}` }
                });

                this.$toast.success('Profile updated successfully!');
                this.editMode = false;
                await this.fetchCustomerProfile();
            } catch (error) {
                console.error("Failed to update profile:", error);
                const errorMsg = error.response?.data?.error || 'Failed to update profile';
                this.$toast.error(errorMsg);
            } finally {
                this.isSaving = false;
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
        await this.fetchCustomerProfile();
    }
});

export default CustProfile;