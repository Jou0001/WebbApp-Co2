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
            chartShowDataMode: 0, // 0 = day, 1 = week, 2 = month, 3 = all time
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
            if (this.password != this.confirmPassword)
            {
                this.errorMessage = "Your password must match"
                return
            }
            const response = await axios.post(URI, {
                username: this.username,
                password: this.password
            }, this.validationStatus);
            console.log(response)
            if (response.status != 200 && response.status != 201) {
                this.errorMessage = "Could not sign up user"
                return
            }
            this.userId = response.data
            console.log("this.userId")
            document.location.href = "index.html"
        },
        async SetChartData()
        {
            this.CO2ChartSource = null
            // get date
            const d = new Date()
            const today = { Day: d.getDate(), Month: (d.getMonth() + 1), Year: d.getFullYear() }
            var startDay
            // get data
            switch (this.chartShowDataMode)
            {
                case 1: // week
                currentDate.setUTCDate(currentDate.getUTCDate() - 7)
                startDay = { Day: d.getDate(), Month: (d.getMonth() + 1), Year: d.getFullYear() }
                break
                case 2: // month
                startDay = { Day: d.getDate(), Month: (d.getMonth()), Year: d.getFullYear() }
                if (startDay.Month == 0)
                {
                    startDay.Month = 12
                    startDay.Year -= 1
                }
                break
                case 3: // all time
                startDay = { Day: 1, Month: 1, Year: 1999 }
                break
                case 0: // day
                default:
                startDay = { Day: d.getDate(), Month: (d.getMonth() + 1), Year: d.getFullYear() }
                break
            }
            // get our data from rest api
            var response = await axios.get(URICO2 + "?startTime="+startDay+", endTime=" + today, this.validateStatus)
            if (response.status != 200)
            {
                console.log("Unable to retrieve CO2 data: " + response.status)
                return
            }
            if (response.data.length == 0)
            {
                console.log("No data in timeframe")
                return
            }
            var labels = []
            var data = []
            for (var i = 0; i < response.data.length; i++)
            {
                labels.push(response.data[i].MeasurementTime)
                data.push(response.data[i].MeasurementValue)
            }


            // get chart from external rest api
            //this.CO2ChartSource = "https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:['January','February', 'March','April', 'May'], datasets:[{label:'Dogs',data:[50,60,70,180,190], fill: false},{label:'Cats',data:[100,200,300,400,500], fill: false}]}}"
            this.CO2ChartSource = "https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:" + labels + ", datasets:[{label:'CO2 measurement',data:"+ data+", fill: false}]}}"
            SetChartImage()
        },
        SetChartImage()
        {
            //console.log("hello")
            var chart = document.getElementById("CO2Chart")
            if (chart && this.CO2ChartSource)
                chart.src = this.CO2ChartSource
            else // try again :)
                setTimeout(this.SetChartImage, 100)
        }

    }
}).mount("#app");
