const CustomerApp = Vue.component('CustomerApp', {
    template: `
      <div v-if="isAuthenticated">
        <nav class="navbar navbar-dark bg-dark">
          <div class="container-fluid">
            <span class="navbar-brand">Customer Dashboard</span>
            <button class="btn btn-outline-warning" @click="logout">Logout</button>
          </div>
        </nav>
        
        <div class="container mt-4">
          <h1>Welcome, {{ userName }}!</h1>
          <p class="lead">Customer Dashboard</p>
          
          <!-- Customer-only content goes here -->
          <div class="card mt-4">
            <div class="card-body">
              <h3>Customer Controls</h3>
              <button class="btn btn-primary me-2">Book Services</button>
              <button class="btn btn-success">My Appointments</button>
              <button class="btn btn-info">Payment History</button>
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
               user?.role === 'customer'
      },
      userName() {
        return this.$store.getters.currentUser?.name || 'Customer'
      }
    },
    data() {
      return {
        loading: true,
        authChecked: false
      };
    },
    mounted() {
      this.checkAuthStatus()
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
      },
      logout() {
        this.$store.dispatch('logout')
        this.$router.push('/login')
      },
      redirectToLogin() {
        this.$router.push('/login')
      }
    }
})

export default CustomerApp