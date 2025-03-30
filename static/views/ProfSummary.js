const ProfSummary = Vue.component("ProfSummary", {
    template: `
      <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-nav mb-4">
          <div class="container-fluid">
            <a class="navbar-brand" href="#">Professional Dashboard</a>
            <div class="collapse navbar-collapse">
              <ul class="navbar-nav me-auto">
                <li class="nav-item">
                  <router-link to="/professional" class="nav-link">Home</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/professional/search" class="nav-link">Search</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/professional/summary" class="nav-link">Summary</router-link>
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
                  <h5>Ratings Given by Customers</h5>
                </div>
                <div class="card-body">
                  <canvas id="ratingsChart" height="300"></canvas>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Service Requests Status</h5>
                </div>
                <div class="card-body">
                  <canvas id="requestsChart" height="300"></canvas>
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
          serviceRequests: []
        }
      };
    },
  
    methods: {
      async fetchSummaryData() {
        try {
          const response = await axios.get("/api/professional/summary");
          this.summaryData = response.data;
          this.loading = false;
  
          // Wait for Vue to update the DOM before rendering charts
          this.$nextTick(() => {
            this.renderCharts();
          });
        } catch (error) {
          console.error("Error fetching summary data:", error);
          alert("Failed to load summary data");
        }
      },
  
      renderCharts() {
        // Ratings Given by Customers (Bar Chart)
        const ratingsCanvas = document.getElementById("ratingsChart");
        if (!ratingsCanvas) {
          console.error("ratingsChart canvas not found!");
          return;
        }
        const ratingsCtx = ratingsCanvas.getContext("2d");
        new Chart(ratingsCtx, {
          type: "bar",
          data: {
            labels: this.summaryData.ratings.map(r => r.customer_name),
            datasets: [{
              label: "Rating",
              data: this.summaryData.ratings.map(r => r.rating),
              backgroundColor: "rgba(54, 162, 235, 0.6)"
            }]
          },
          options: { responsive: true }
        });
  
        // Service Requests Status (Bar Chart)
        const requestsCtx = document.getElementById("requestsChart").getContext("2d");
        new Chart(requestsCtx, {
          type: "bar",
          data: {
            labels: ["Received", "Completed", "Rejected"],
            datasets: [{
              label: "Number of Requests",
              data: [
                this.summaryData.serviceRequests.received,
                this.summaryData.serviceRequests.completed,
                this.summaryData.serviceRequests.rejected
              ],
              backgroundColor: ["#ff6384", "#36a2eb", "#ffce56"]
            }]
          },
          options: { responsive: true }
        });
      },
  
      logout() {
        this.$store.dispatch('logout');
        this.$router.push('/login');
      }
    },
  
    mounted() {
      this.fetchSummaryData();
    }
  });
  
  export default ProfSummary;
  