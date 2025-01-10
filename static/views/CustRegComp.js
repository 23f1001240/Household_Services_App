const CustRegComp = Vue.component('CustRegComp', {
    template: `
      <div class="row justify-content-center m-3 text-color-light">
        <div class="card bg-light" style="width: 26rem;">
          <div class="card-body">
            <div class="d-flex justify-content-end">
              <!-- Cross button to close the card -->
              <button type="button" class="btn-close" aria-label="Close" @click="closeCard"></button>
            </div>
            <h5 class="card-title">Customer Signup</h5>
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label class="form-label">Email Address (Username)</label>
                <input type="email" v-model="email" class="form-control" required>
                <div v-if="message" class="alert alert-warning">
                  {{message}}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <input type="password" v-model="password" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input type="text" v-model="name" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Address</label>
                <textarea v-model="address" class="form-control" rows="3" required></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Pincode</label>
                <input type="text" v-model="pincode" class="form-control" pattern="\\d{6}" maxlength="6" required>
                <small class="form-text text-muted">Enter a valid 6-digit pincode.</small>
              </div>
              <button type="submit" class="btn btn-outline-primary">Sign up</button>
            </form>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        email: '',
        password: '',
        name: '',
        address: '',
        pincode: '',
        message: ''
      };
    },
    methods: {
      closeCard() {
        if (this.$route.path !== '/') {
          this.$router.push('/');
        }
      },
      handleFileUpload(event) {
        this.file = event.target.files[0];
      },
      async submitForm() {
        const formData = new FormData();
        formData.append('email', this.email);
        formData.append('password', this.password);
        formData.append('name', this.name);
        formData.append('address', this.address);
        formData.append('pincode', this.pincode);
  
        try {
          const response = await fetch('http://127.0.0.1:5000/signup', {
            method: 'POST',
            body: formData
          });
  
          if (response.status === 201) {
            const data = await response.json();
            alert(data.message);
            if (this.$route.path !== '/login') {
              this.$router.push('/login');
              this.closeCard();
            }
          } else if (response.status === 409) {
            const data = await response.json();
            alert(data.message);
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  });
  
  export default CustRegComp;
  