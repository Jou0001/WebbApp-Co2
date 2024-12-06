const URI = "https://localhost:7103/api/Users"; 
const URICO2 = "https://localhost:7103/api/CO2";

Vue.createApp({
    data() {
        return {
            username: '',
            password: '',
            confirmPassword: '',
            userId: null,
            errorMessage: null,
            CO2ChartSource: "",
            warningValue: 1000,  
            showInput: false,  
            activeSensor: null,
            validationStatus: {
                validateStatus: function (status) {
                    return true;
                }
            }
        };
    },
    created() {
        if (document.title == "Luftkontrol") {
            document.addEventListener("keypress", (e) => {
                if (e.key != "Enter") return;
                e.preventDefault();
                var btn = document.getElementById("loginButton");
                if (btn) btn.click();
                this.SetChartData();
            });
        }
    },
    methods: {
        async Login() {
            const response = await axios.post(URI + "/login", {
                username: this.username,
                password: this.password
            }, this.validationStatus);
            if (response.status != 200) {
                this.errorMessage = "Your username or password was incorrect";
                return;
            }
            this.userId = response.data;
            console.log(this.userId);
        },

        async signUpUser() {
            if (this.password != this.confirmPassword) {
                this.errorMessage = "Your password must match";
                return;
            }
            const response = await axios.post(URI, {
                username: this.username,
                password: this.password
            }, this.validationStatus);
            console.log(response);
            if (response.status != 200 && response.status != 201) {
                this.errorMessage = "Could not sign up user";
                return;
            }
            this.userId = response.data;
            console.log(this.userId);
            document.location.href = "index.html";
        },

        async SetChartData() {
            this.CO2ChartSource = "https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:['January','February', 'March','April', 'May'], datasets:[{label:'Dogs',data:[50,60,70,180,190], fill: false},{label:'Cats',data:[100,200,300,400,500], fill: false}]}}";
        },

        SetChartImage() {
            var chart = document.getElementById("CO2Chart");
            if (chart && this.CO2ChartSource)
                chart.src = this.CO2ChartSource;
            else
                setTimeout(this.SetChartImage, 100);
        },

        
        toggleInput() {
            this.showInput = true; 
        },

        
        async updateWarningValue() {
            try {
                const response = await axios.put(URICO2 + "/ChangeWarning", {
                    userId: this.userId,
                    sensorId: this.activeSensor,
                    warningValue: this.warningValue   
                });

                if (response.status === 200) {
                    console.log("Warning value updated successfully");
                    this.toggleInput()
                    alert("Warning value updated successfully")
                } else {
                    console.log("Failed to update warning value");
                    alert("Failed to update warning value")
                }
            } catch (error) {
                console.error("Error updating warning value:", error);
                alert("Error updating warning value: " + error)
            }
        }
    }
}).mount("#app");

