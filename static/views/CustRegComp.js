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
                <label class="form-label">Phone Number</label>
                <input type="text" v-model="phone_number" class="form-control" pattern="\\d{10}" maxlength="10" required>
                <small class="form-text text-muted">Enter a valid 10-digit phone number.</small>
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
        phone_number: '',
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
        const data = {
          email: this.email,
          password: this.password,
          name: this.name,
          address: this.address,
          phone_number: this.phone_number,
          pincode: this.pincode
        };
      
        try {
          const response = await fetch('/auth/custregister', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
      
          if (response.ok) {
            const responseData = await response.json();
            alert(responseData.message);
            if (this.$route.path !== '/login') {
              this.$router.push('/login');
              this.closeCard();
            }
          } else if (response.status === 409) {
            const responseData = await response.json();
            alert(responseData.error);
          } else {
            throw new Error('Something went wrong');
          }
        } catch (error) {
          console.error(error);
          this.message = 'An error occurred while submitting the form.';
        }
      }
    }
  });
  
  export default CustRegComp;
  