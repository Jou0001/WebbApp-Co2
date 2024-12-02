const URI = "https://localhost:7103/api/Users";

Vue.createApp({
    data() {
        return {
            username: '',
            password: '',
            userId: null,
            errorMessage: null,
            CO2ChartSource: "",
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
                this.SetChartData()
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
        },
        async SetChartData()
        {
            this.CO2ChartSource = "https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:['January','February', 'March','April', 'May'], datasets:[{label:'Dogs',data:[50,60,70,180,190], fill: false},{label:'Cats',data:[100,200,300,400,500], fill: false}]}}"
        },
        SetChartImage()
        {
            //console.log("hello")
            var chart = document.getElementById("CO2Chart")
            if (chart)
                chart.src = this.CO2ChartSource
            else // try again :)
                setTimeout(this.SetChartImage, 100)
        }

    }
}).mount("#app");
