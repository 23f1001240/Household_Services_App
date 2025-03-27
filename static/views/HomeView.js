const HomeView = Vue.component('HomeView', {
  template: `
    <div>
      <header class="bg-black text-warning text-center py-3">
          <h1>Welcome to Homify !</h1>
      </header>
      
      <section style="background: url('static/img/bgHome.jpeg'); background-size: cover; background-position: center; height: 91vh;">
          <div class="d-flex align-items-center" style="height: 91vh;">
              <div class="container text-center p-5 rounded shadow-lg" style="background-color: white; width: 40%; border-radius: 15px; position: absolute; left: 5%;">
                  <h2></h2>
                  <p class="lead">Life gets busy, and household tasks should not add to your stress. That is where we step in!</p>
                  <p class="lead">Get help here..</p>

                  <!-- Login and Register Buttons -->
                  <div class="mt-3">
                      <a class="btn btn-outline-dark" @click="login">Login</a>
                      <a class="btn btn-outline-success" @click="proregister">Register as Professional</a>
                  </div>
                  <div>
                      <a class="btn btn-link" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Signup as a customer here" @click="custregister">Not signed up yet?</a>
                  </div>
              </div>
          </div>
      </section>
    </div>
  `,
  methods: {
      login() {
          if (this.$route.path !== '/login') {
              this.$router.push('/login');
          }
      },
      custregister() {
          if (this.$route.path !== '/custregister') {
              this.$router.push('/custregister');
          }
      },
      proregister() {
          if (this.$route.path !== '/proregister') {
              this.$router.push('/proregister');
          }
      },
      redirectUser() {
          const role = this.$store.getters.currentUser?.role;  // Get role from Vuex store
          if (role === 'professional' && this.$route.path !== '/professional') {
              this.$router.push('/professional');
          } else if (role === 'customer' && this.$route.path !== '/customer') {
              this.$router.push('/customer');
          }
      }
  },
  mounted() {
      this.redirectUser();  // Redirect user on page load
  }
})

export default HomeView;
