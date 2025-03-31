const AdminSummary = Vue.component("AdminSummary", {
    template: `
      <div>
        <!-- Navbar -->
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
  
        <!-- Summary Charts -->
        <div v-if="loading" class="text-center mt-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
  
        <div v-else>
          <div class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Overall Customer Ratings</h5>
                </div>
                <div class="card-body">
                  <canvas id="ratingsChart" height="300"></canvas>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Service Requests Summary</h5>
                </div>
                <div class="card-body">
                  <canvas id="requestsChart" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
  
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Services Distribution</h5>
                </div>
                <div class="card-body">
                  <canvas id="servicesChart" height="300"></canvas>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Professionals Status</h5>
                </div>
                <div class="card-body">
                  <canvas id="professionalsChart" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  
    data() {
      return {
        loading: true,
        summaryData: {
          ratings: [],
          requestsSummary: [],
          servicesDistribution: [],
          professionalsStatus: []
        }
      };
    },
  
    methods: {
        async fetchSummaryData() {
            try {
              const response = await axios.get("/api/admin/summary");
              this.summaryData = response.data;
              this.loading = false;
          
              // Wait for Vue to update the DOM before accessing canvas elements
              this.$nextTick(() => {
                this.renderCharts();
              });
            } catch (error) {
              console.error("Error fetching summary data:", error);
              alert("Failed to load summary data");
            }
        },
          
      renderCharts() {
        // Ratings Chart (Bar)
        const ratingsCanvas = document.getElementById("ratingsChart");
        if (!ratingsCanvas) {
            console.error("ratingsChart canvas not found!");
            return;
        }
        const ratingsCtx = document.getElementById("ratingsChart").getContext("2d");
        new Chart(ratingsCtx, {
          type: "bar",
          data: {
            labels: this.summaryData.ratings.map(r => r.service_name),
            datasets: [{
              label: "Average Rating",
              data: this.summaryData.ratings.map(r => r.average_rating),
              backgroundColor: "rgba(54, 162, 235, 0.6)"
            }]
          },
          options: { responsive: true }
        });
  
        // Service Requests Summary (Pie)
        const requestsCtx = document.getElementById("requestsChart").getContext("2d");
        new Chart(requestsCtx, {
          type: "pie",
          data: {
            labels: this.summaryData.requestsSummary.map(r => r.status),
            datasets: [{
              data: this.summaryData.requestsSummary.map(r => r.count),
              backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"]
            }]
          },
          options: { responsive: true }
        });
  
        // Services Distribution (Doughnut)
        const servicesCtx = document.getElementById("servicesChart").getContext("2d");
        new Chart(servicesCtx, {
          type: "doughnut",
          data: {
            labels: this.summaryData.servicesDistribution.map(s => s.service_name),
            datasets: [{
              data: this.summaryData.servicesDistribution.map(s => s.count),
              backgroundColor: ["#ff9f40", "#4bc0c0", "#9966ff"]
            }]
          },
          options: { responsive: true }
        });
  
        // Professionals Status (Bar)
        const professionalsCtx = document.getElementById("professionalsChart").getContext("2d");
        new Chart(professionalsCtx, {
          type: "bar",
          data: {
            labels: this.summaryData.professionalsStatus.map(p => p.status),
            datasets: [{
              label: "Count",
              data: this.summaryData.professionalsStatus.map(p => p.count),
              backgroundColor: "rgba(75, 192, 192, 0.6)"
            }]
          },
          options: { responsive: true }
        });
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
        this.fetchSummaryData();
      }      
  });
  
  export default AdminSummary;
  