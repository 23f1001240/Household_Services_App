const index = new Vuex.Store({
    state: {
      auth: {
        user: JSON.parse(localStorage.getItem('user_data')) || null,
        token: localStorage.getItem('auth_token') || null
      }
    },
    getters: {
      isAuthenticated: state => !!state.auth.token,
      currentUser: state => state.auth.user
    },
    mutations: {
      SET_USER(state, user) {
        state.auth.user = user;
        localStorage.setItem('user_data', JSON.stringify(user));
      },
      SET_TOKEN(state, token) {
        state.auth.token = token;
        localStorage.setItem('auth_token', token);
  
        try {
          // Decode the JWT payload
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // If the payload contains user info, set it
          if (payload && payload.name && payload.role) {
            state.auth.user = payload;
            localStorage.setItem('user_data', JSON.stringify(payload));
          }
        } catch (error) {
          console.error("Invalid token format:", error);
        }
      },
      CLEAR_AUTH(state) {
        state.auth.user = null;
        state.auth.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    },
    actions: {
      async login({ commit }, credentials) {
        try {
          const response = await fetch('http://127.0.0.1:5000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
  
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }
  
          const data = await response.json();
          if (!data.user) throw new Error("User data missing from response");

          commit('SET_TOKEN', data.token || data.user.auth_token);
          commit('SET_USER', data.user);
          return data.user;
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },
      logout({ commit }) {
        commit('CLEAR_AUTH');
      }
    }
  });
  
  export default index;  