const ProRegComp = Vue.component('ProRegComp', {
  template: `
    <div class="row justify-content-center m-3 text-color-light">
      <div class="card bg-light" style="width: 26rem;">
        <div class="card-body">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn-close" aria-label="Close" @click="closeCard"></button>
          </div>
          <h5 class="card-title">Service Professional Signup</h5>
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
              <label class="form-label">Service Name</label>
              <select class="form-control" v-model="service_id" required>
                <option value="" disabled>Select Service</option>
                <option v-for="service in services" :value="service.id" :key="service.id">
                  {{ service.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Experience (in years)</label>
              <input type="number" v-model="experience" class="form-control" min="0" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Upload Resume (PDF, JPG, PNG)</label>
              <input type="file" @change="handleFileUpload" accept=".pdf, .jpg, .jpeg, .png" class="form-control" required>
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
            <div class="mb-3">
                <label class="form-label">Phone Number</label>
                <input type="text" v-model="phone_number" class="form-control" pattern="\\d{10}" maxlength="10" required>
                <small class="form-text text-muted">Enter a valid 10-digit phone number.</small>
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
      service_id: '',
      experience: '',
      file: null,
      address: '',
      pincode: '',
      phone_number: '',
      message: '',
      services: []
    };
  },
  async created() {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        this.services = await response.json()
      } else {
        console.error('Failed to fetch services')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  },
  methods: {
    closeCard() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    handleFileUpload(event) {
      this.file = event.target.files[0]
    },
    async submitForm() {
      const formData = new FormData()
      formData.append('email', this.email)
      formData.append('password', this.password)
      formData.append('name', this.name)
      formData.append('service_id', this.service_id)
      formData.append('experience', this.experience)
      formData.append('file', this.file)
      formData.append('address', this.address)
      formData.append('pincode', this.pincode)
      formData.append('phone_number', this.phone_number)

      try {
        const response = await fetch('/auth/proregister', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message);
          if (this.$route.path !== '/login') {
            this.$router.push('/login')
            this.closeCard()
          }
        } else if (response.status === 409) {
          this.message = data.error
        } else {
          throw new Error(data.error || 'Something went wrong')
        }
      } catch (error) {
        console.error(error)
        this.message = 'An error occurred while submitting the form.'
      }
    }
  }
})

export default ProRegComp