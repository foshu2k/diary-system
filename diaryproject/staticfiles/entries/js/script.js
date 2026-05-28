document.addEventListener("DOMContentLoaded", function () {

    // Voice Command
    const voiceNavBtn = document.getElementById("micNavBtn")

    // Speech to Text
    const speechBtn = document.getElementById("micBtn")
    const clearBtn = document.getElementById("clearBtn")
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    // Feedback
    const voiceFeedback = () => {
        if (sessionStorage.getItem("voiceNavTriggered") !== "true") return;

        let text = sessionStorage.getItem("voiceNavFeedback");

        if (text) {
            const voice = new SpeechSynthesisUtterance(text)
            window.speechSynthesis.speak(voice);
        }

        sessionStorage.removeItem("voiceNavFeedback")
    }

    voiceFeedback()

    // Voice Command Functionality
    if (voiceNavBtn) {
        const micNavIcon = document.getElementById("micNavIcon")

        if (!SpeechRecognition) {
            voiceNavBtn.disabled = true
        } else {
            let isNavigating = false
            let navObj = null

            const commands = {
                "go home": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the home page.");
                    window.location.href = "/"
                },
                "go to home": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the home page.");
                    window.location.href = "/"
                },
                "go back": () => window.history.back(),
                "go forward": () => window.history.forward(),
                "go to profile": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the profile page.");
                    window.location.href = "/accounts/profile/"
                },
                "go to entries": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry list page.");
                    window.location.href = "/entrylist/"
                },
                "go to entry list": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry list page.")
                    window.location.href = "/entrylist/"
                },
                "view entries": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry list page.")
                    window.location.href = "/entrylist/"
                },
                "view all entries": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry list page.")
                    window.location.href = "/entrylist/"
                },
                "create entry": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry creation page.")
                    window.location.href = "/create/"
                },
                "new entry": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry creation page.")
                    window.location.href = "/create/"
                },
                "add entry": () => {
                    sessionStorage.setItem("voiceNavFeedback", "You are at the entry creation page.")
                    window.location.href = "/create/"
                },
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
                micNavIcon.src = "/static/entries/svg/mic-recording.svg"
                navObj = new SpeechRecognition()
                navObj.start()
                navObj.onresult = handleCommand
            }

            function handleCommand(e) {
                const last = e.results.length - 1
                const said = e.results[last][0].transcript.trim().toLowerCase()

                const match = Object.keys(commands).find(cmd => said.includes(cmd))
                if (match) {
                    sessionStorage.setItem("voiceNavTriggered", "true")
                    commands[match]()
                }
            }

            function stopNavigating() {
                isNavigating = false
                micNavIcon.src = "/static/entries/svg/mic-idle.svg"
                if (navObj) {
                    navObj.stop()
                    navObj = null
                }
            }
        }
    }

    // Speech to Text Functionality
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

            if(clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (isRecording) {
                        stopRecording()
                        isRecording = false
                    }
                    
                    outputField.value = ""
                })
            }

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
})