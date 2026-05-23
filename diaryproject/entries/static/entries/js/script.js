document.addEventListener("DOMContentLoaded", function () {
    const speechBtn = document.getElementById("micBtn")
    const micIcon = document.getElementById("micIcon")
    const outputField = document.getElementById("id_content")

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
        speechBtn.disabled = true
        navBtn.disabled = true
        return
    }

    // Speech to Text (Forms)
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
})