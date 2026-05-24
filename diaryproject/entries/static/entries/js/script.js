document.addEventListener("DOMContentLoaded", function () {

    // Speech to Text
    const speechBtn = document.getElementById("micBtn")

    // Voice Command
    const voiceNavBtn = document.getElementById("micNavBtn")

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (speechBtn) {
        const micIcon = document.getElementById("micIcon")
        const outputField = document.getElementById("id_content")

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

    if (voiceNavBtn) {
        const micNavIcon = document.getElementById("micNavIcon")

        if (!SpeechRecognition) {
            speechBtn.disabled = true
        } else {
            let isNavigating = false
            let navObj = null

            const commands = {
                "go home": () => window.location.href = "/",
                "go back": () => window.history.back(),
                "go forward": () => window.history.forward(),
                "go to entries": () => window.location.href = "/entrylist/",
                "create entry": () => window.location.href = "/create/",
                "new entry": () => window.location.href = "/create/",
            }

            voiceNavBtn.addEventListener("click", () => {
            isNavigating = !isNavigating

                if (isNavigating) {
                    startNavigating()
                } else {
                    stopNavigating()
                }
            })

            function startNavigating() {
                voiceNavBtn.setAttribute("aria-pressed", "true")
                voiceNavBtn.setAttribute("aria-label", "Stop voice navigation")

                micNavIcon.src = "/static/entries/svg/mic-recording.svg"
                navObj = new SpeechRecognition()
                navObj.continuous = true
                navObj.interimResults = false
                navObj.start()

                navObj.onresult = handleCommand

                navObj.onend = () => {
                    if (isNavigating) navObj.start()
                }

                navObj.onerror = (e) => {
                    if (e.error !== "no-speech") stopNavigating()
                }
            }

            function handleCommand(e) {
                const last = e.results.length - 1
                const said = e.results[last][0].transcript.trim().toLowerCase()

                const match = Object.keys(commands).find(cmd => said.includes(cmd))
                if (match) {
                    commands[match]()
                } else {
                    console.log("Voice nav: no command matched for →", said)
                }
            }

            function stopNavigating() {
                voiceNavBtn.setAttribute("aria-pressed", "false")
                voiceNavBtn.setAttribute("aria-label", "Start voice navigation")
                
                isNavigating = false
                micNavIcon.src = "/static/entries/svg/mic-idle.svg"
                if (navObj) {
                    navObj.onend = null
                    navObj.stop()
                    navObj = null
                }
            }
        }
    }
})