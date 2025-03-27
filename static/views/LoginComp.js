const LoginComp = Vue.component('LoginComp', {
  template: `
    <div class="row justify-content-center m-3">
      <div class="card bg-light" style="width: 18rem;">
        <div class="card-body">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn-close" aria-label="Close" @click="closeCard"></button>
          </div>
          <h5 class="card-title">Sign In</h5>
          <form @submit.prevent="submitForm">
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" v-model="email" class="form-control" id="email" required>
              <div v-if="message" class="alert alert-warning">
                {{ message }}
              </div>
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" v-model="password" class="form-control" id="password" required>
            </div>
            <button type="submit" class="btn btn-outline-primary" :disabled="loading">
              <span v-if="!loading">Login</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Logging in...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      message: '',
      loading: false
    }
  },
  methods: {
    closeCard() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    async submitForm() {
      this.loading = true;
      this.message = '';
      
      try {
        // Dispatch login action to Vuex store
        await this.$store.dispatch('login', {
          email: this.email,
          password: this.password
        });

        // Get user data from store
        const user = this.$store.state.auth.user;
        
        // Role-based redirection
        const routes = {
          'admin': '/admin',
          'professional': user.status ? '/professional' : null,
          'customer': '/customer'
        };

        const targetRoute = routes[user.role];
        
        if (targetRoute) {
          this.$router.push(targetRoute);
        } else {
          this.message = "Your account is pending approval";
        }

      } catch (error) {
        console.error('Login error:', error);
        this.message = error.message || "Login failed. Please try again.";
      } finally {
        this.loading = false;
      }
    }
  }
})

export default LoginComp;