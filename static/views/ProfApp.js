const ProfApp = Vue.component('ProfApp', {
    template: `
      <div v-if="isAuthenticated">
        <nav class="navbar navbar-dark bg-dark">
          <div class="container-fluid">
            <span class="navbar-brand">Professional Dashboard</span>
            <button class="btn btn-outline-warning" @click="logout">Logout</button>
          </div>
        </nav>
        
        <div class="container mt-4">
          <h1>Welcome, {{ userName }}!</h1>
          <p class="lead">You have professional privileges</p>
          
          <!-- Professional-only content goes here -->
          <div class="card mt-4">
            <div class="card-body">
              <h3>Professional Controls</h3>
              <button class="btn btn-primary me-2">Manage Services</button>
              <button class="btn btn-success">View Reports</button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center mt-5">
        <div class="spinner-border text-primary" role="status" v-if="loading">
          <span class="visually-hidden">Loading...</span>
        </div>
        <div v-else>
          <h2>Access Denied</h2>
          <p>You don't have permission to view this page.</p>
          <button class="btn btn-primary" @click="redirectToLogin">Go to Login</button>
        </div>
      </div>
    `,
    computed: {
        isAuthenticated() {
          const user = this.$store.getters.currentUser
          return this.$store.getters.isAuthenticated && 
                 user?.role === 'professional' &&
                 user?.status === true
        }
      },
    data() {
    return {
        loading: true,
        authChecked: false
    };
    },
    mounted() {
        this.checkAuthStatus();
      },
    methods: {
    async checkAuthStatus() {
        try {
        await this.$store.dispatch('checkAuth')
        if (!this.isAuthenticated) {
            this.$router.push('/login')
        }
        } catch (error) {
        console.error("Auth check failed:", error)
        this.$router.push('/login')
        } finally {
        this.loading = false
        this.authChecked = true
        }
    }
    }
})

export default ProfApp