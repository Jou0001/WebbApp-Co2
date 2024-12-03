const URI = "https://localhost:7103/api/Users";

const validationStatus = {
    validateStatus: function (status) {
        return true;
    }
}

Vue.createApp({
    data() {
        return {
            username: '',
            password: '',
            userId: null,
            errorMessage: null,
            validationStatus: {
                validateStatus: function (status) {
                    return true;
                }
            },


        };
    },
    methods: {
        async Login() {
            const response = await axios.post(URI + "/login", {
                username: this.username,
                password: this.password
            }, this.validationStatus);
            if (response.status != 200)
            {
                this.errorMessage = "Your username or password was incorrect"
                return
            }            
            this.userId = response.data
            console.log(this.userId)

        },
        async signUpUser() {
            const response = await axios.post(URI, {
                username: this.username,
                password: this.password
            }, this.validationStatus);
            if (response.status != 200) {
                errorMessage = "Your username or password was incorrect"
                return
            }
            this.userId = response.data
            console.log(this.userId)




        }

    }
}).mount("#app");
