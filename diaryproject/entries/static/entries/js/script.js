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

    // Calendar Date Filter
    const dateFilter = document.getElementById("dateFilter")

    if (dateFilter) {
        const params = new URLSearchParams(window.location.search)
        if (params.get("date")) dateFilter.value = params.get("date")

        dateFilter.addEventListener("change", () => {
            if (dateFilter.value) {
                window.location.href = `?date=${dateFilter.value}`
            }
        })
    }
})