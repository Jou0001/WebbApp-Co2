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
        async SetChartDataWithValue(value)
        {
            this.chartShowDataMode = value
            this.SetChartData()
        },
        async SetChartData()
        {
            this.CO2ChartSource = null
            // get date
            const d = new Date()
            var os = d.getTimezoneOffset();
            const today = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
            var timeBetweenMeasurements
            var startDay
            // get data
            switch (this.chartShowDataMode)
            {
                case 1: // week // 2 per day
                currentDate = new Date()
                currentDate.setUTCDate(currentDate.getUTCDate() - 7)
                startDay = { Day: currentDate.getDate(), Month: currentDate.getMonth(), Year: currentDate.getFullYear() }
                timeBetweenMeasurements = 12
                break
                case 2: // month // 1 per day
                startDay = { Day: d.getDate(), Month: (d.getMonth() - 1), Year: d.getFullYear() }
                if (startDay.Month < 0)
                {
                    startDay.Month = 11
                    startDay.Year -= 1
                }
                timeBetweenMeasurements = 24
                break
                case 3: // all time // 1 per day
                //startDay = { Day: 1, Month: 1, Year: 1999 }
                startDay = null
                timeBetweenMeasurements = 24
                break
                case 0: // day // 1 per hour
                default:
                startDay = { Day: d.getDate(), Month: d.getMonth(), Year: d.getFullYear() }
                timeBetweenMeasurements = 1
                break
            }
            if (startDay)
                startDay = new Date(startDay.Year, startDay.Month, startDay.Day)
            // get our data from rest api
            this.activeSensor = 1
            var quiries
            if (startDay)
                var quiries = "?startTime=" + new Date(startDay.getTime() - os * 60 * 1000).toJSON()+"&endTime=" + new Date(today.getTime() - os * 60 * 1000).toJSON()
            else
                var quiries = "" // all time, don't need any quiries :)
            // testing via swagger we notices all ":" were replaced with "%3A", in the quiries, at least for DateTime
            var response = await axios.get(URICO2 + "/" + this.activeSensor + quiries.replaceAll(":", "%3A"), this.validateStatus)
            
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
            // filter data quantity
            var usedData = []
            usedData.push(response.data[0])
            var lastMeasurementTime = new Date(response.data[0].measurementTime)
            var lastDate = -1
            var date = lastMeasurementTime.getDate()
            timeBetweenMeasurements = timeBetweenMeasurements * 60 * 60
            // timeBetweenMeasurements
            //usedData.push(response.data[0])
            // measurementsPerDay
            for (var i = 1; i < response.data.length - 1; i++)
            {
                var currentMeasurementTime = new Date(response.data[i].measurementTime)

                var currentTime = currentMeasurementTime.getHours() * 60 * 60 + currentMeasurementTime.getMinutes() * 60 + currentMeasurementTime.getSeconds() + currentMeasurementTime.getDate() * 60 * 60 * 24
                var oldTime = lastMeasurementTime.getHours() * 60 * 60 + lastMeasurementTime.getMinutes() * 60 + lastMeasurementTime.getSeconds() + lastMeasurementTime.getDate() * 60 * 60 * 24
                
                // check time difference is good
                var difference = Math.abs(currentTime - oldTime)
                if (difference < timeBetweenMeasurements)
                    continue

                // add it to usedData
                usedData.push(response.data[i])
                lastMeasurementTime = currentMeasurementTime
            }
            // we always want the newest data along with some of the old data
            usedData.push(response.data[response.data.length - 1])
            
            var labels = []
            var data = []
            for (var i = 0; i < usedData.length; i++)
            {
                console.log(usedData[i])
                labels.push(usedData[i].measurementTime)
                data.push(usedData[i].measurementValue)
            }
            console.log(labels)
            console.log(data)
            var labelsAsArrayString = "["
            for (var i = 0; i < labels.length; i++)
                labelsAsArrayString += "'" + labels[i] + "',"
            labelsAsArrayString = labelsAsArrayString.slice(0, labelsAsArrayString.length - 1)
            labelsAsArrayString += "]"
            // get chart from external rest api
            //this.CO2ChartSource = "https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:['January','February', 'March','April', 'May'], datasets:[{label:'Dogs',data:[50,60,70,180,190], fill: false},{label:'Cats',data:[100,200,300,400,500], fill: false}]}}"
            this.CO2ChartSource = "https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:" + labelsAsArrayString + ", datasets:[{label:'CO2 measurement',data:["+ data+"], fill: false}]}}"
            // https://quickchart.io/chart?width=500&height=300&chart={type:'line',data:{labels:['2024-12-06T10:30:15.457'], datasets:[{label:'CO2 measurement',data:[1000], fill: false}]}}
            this.SetChartImage()
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

