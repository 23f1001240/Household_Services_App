const HomeView = Vue.component('HomeView', {
    template: `
      <div>
        <header class="bg-black text-warning text-center py-3">
            <h1>Welcome to SwiftAid!</h1>
        </header>
        
        <section style="background: url('static/img/bgHome.jpeg'); background-size: cover; background-position: center; height: 91vh;">
            <div class="d-flex align-items-center" style="height: 91vh;">
                <div class="container text-center p-5 rounded shadow-lg" style="background-color: white; width: 40%; border-radius: 15px; position: absolute; left: 5%;">
                    <h2></h2>
                    <p class="lead">Life gets busy, and household tasks should not add to your stress. That is where we step in!</p>
                    <p class="lead">Get help here..</p>
                    
                    <!-- Visit Now Button with Tooltip -->
                    <button type="button" class="btn btn-danger btn-lg" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Please login or register to continue.">
                        Visit Now
                    </button>

                    <!-- Login and Register Buttons -->
                    <div class="mt-3">
                        <a class="btn btn-outline-dark btn-sm" @click="login">Login</a>
                        <a class="btn btn-outline-dark btn-sm" @click="register">Register</a>
                    </div>
                </div>
            </div>
        </section>
      </div>
    `,
  });
export default HomeView; 