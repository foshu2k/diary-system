document.addEventListener("DOMContentLoaded", function () {

    // Speech to Text
    const speechBtn = document.getElementById("micBtn")

    if (speechBtn) {
        const micIcon = document.getElementById("micIcon")
        const outputField = document.getElementById("id_content")
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            speechBtn.disabled = true
        } else {
            let isRecording = false
            let speechObj = null

            speechBtn.addEventListener("click", () => {
                isRecording = !isRecording

                if (isRecording) {
                    startRecording()
                } else {
                    stopRecording()
                }
            })

            function startRecording() {
                micIcon.src = "/static/entries/svg/mic-recording.svg"
                speechObj = new SpeechRecognition()
                speechObj.start()
                speechObj.onresult = transcribe
            }

            function transcribe(e) {
                const transcript = e.results[0][0].transcript
                outputField.value += transcript + " "
            }

            function stopRecording() {
                micIcon.src = "/static/entries/svg/mic-idle.svg"
                if (speechObj) {
                    speechObj.stop()
                    speechObj = null
                }
            }
        }
    }

    // Dropdowns
    window.toggleDropdown = function (id) {
        document.querySelectorAll(".dropdown-menu").forEach(menu => {
            if (menu.id !== id) menu.classList.remove("open")
        })
        document.getElementById(id).classList.toggle("open")
    }

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown-menu").forEach(menu => menu.classList.remove("open"))
        }
    })

})