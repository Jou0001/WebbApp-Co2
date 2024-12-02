const URI = "";
Vue.createApp({
    data() {
        return {
            username: '',
            password: '',
            

            
        };
    },
    methods: {
        async Login() {
            const response = await axios.post(uri, {
                username: this.username,
                password: this.password
            });
            if (response.status != 200) 
                return
            
            
        },
       
    }
}).mount("#app");
