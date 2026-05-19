document.addEventListener("DOMContentLoaded", function () {
    const speechBtn = document.getElementById("micBtn")
    const outputField = document.getElementById("id_content")

    let isRecording = false
    let speechObj = null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if(!SpeechRecognition) {
        speechBtn.innerText = "Speech Recognition is not enabled"
        speechBtn.disabled = true
    }

    speechBtn.addEventListener('click', () => {
        isRecording = !isRecording
        isRecording ? startRecording() : stopRecording()
    })

    function startRecording() {
        speechBtn.innerText = "Recording..."
        speechObj = new SpeechRecognition()
        speechObj.start()
        speechObj.onresult = transcribe
    }

    function transcribe(e) {
        const transcript = e.results[0][0].transcript
        outputField.value += transcript + " "
    }

    function stopRecording() {
        speechObj.stop()
        speechObj = null
        speechBtn.innerText = "Start Recording"
    }
})