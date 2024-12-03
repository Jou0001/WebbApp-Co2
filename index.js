const URI = "https://localhost:7103/api/Users";

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
    created()
    {
        if (document.title == "Luftkontrol")
        {
            document.addEventListener("keypress", (e) => {
                if (e.key != "Enter")
                    return
                e.preventDefault();
                var btn = document.getElementById("loginButton")
                if (btn) btn.click()
              });
        }
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
