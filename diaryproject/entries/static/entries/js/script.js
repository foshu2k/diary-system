document.addEventListener("DOMContentLoaded", function () {

    // DEBUG — remove after fixing
    console.log("Script loaded on:", window.location.pathname)
    console.log("pendingFeedback value:", sessionStorage.getItem("voiceFeedback"))
    console.log("speechSynthesis available:", 'speechSynthesis' in window)

    // Voice Command
    const voiceNavBtn = document.getElementById("micNavBtn")
    const pendingFeedback = sessionStorage.getItem("voiceFeedback")

    // Speech to Text
    const speechBtn = document.getElementById("micBtn")
    const clearBtn = document.getElementById("clearBtn")
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    function speak(text) {
        console.log("speak() called with:", text)
        console.log("speechSynthesis speaking:", window.speechSynthesis.speaking)
        console.log("speechSynthesis paused:", window.speechSynthesis.paused)

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onstart = () => console.log("utterance started")
        utterance.onend = () => console.log("utterance ended")
        utterance.onerror = (e) => console.error("utterance error:", e.error)

        utterance.volume = 1
        utterance.rate = 1
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
    }

    // Voice Command Functionality
    if (voiceNavBtn) {
        const micNavIcon = document.getElementById("micNavIcon")

        if (!SpeechRecognition) {
            voiceNavBtn.disabled = true
        } else {
            let isNavigating = false
            let navObj = null

            const commands = {
                // --- HOME NAVIGATION ---
                "go home": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now on the home page")
                    stopNavigating()
                    window.location.href = "/"
                },
                "go to home": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now on the home page")
                    stopNavigating()
                    window.location.href = "/"
                },

                // --- HISTORY NAVIGATION ---
                // Use sessionStorage so feedback plays after the destination page loads,
                // not before — speak() would get cut off by the navigation otherwise.
                "go back": () => {
                    sessionStorage.setItem("voiceFeedback", "Going back")
                    stopNavigating()
                    setTimeout(() => { window.history.back() }, 300)
                },
                "go forward": () => {
                    sessionStorage.setItem("voiceFeedback", "Going forward")
                    stopNavigating()
                    setTimeout(() => { window.history.forward() }, 300)
                },

                // --- PROFILE NAVIGATION ---
                "go to profile": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now on your profile")
                    stopNavigating()
                    window.location.href = "/profile/"
                },

                // --- VIEW ENTRIES ---
                "go to entries": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now viewing entries")
                    stopNavigating()
                    window.location.href = "/entrylist/"
                },
                "go to entry list": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now viewing the entry list")
                    stopNavigating()
                    window.location.href = "/entrylist/"
                },
                "view entries": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now viewing entries")
                    stopNavigating()
                    window.location.href = "/entrylist/"
                },
                "view all entries": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now viewing all entries")
                    stopNavigating()
                    window.location.href = "/entrylist/"
                },

                // --- CREATE ENTRY ---
                "create entry": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now creating a new entry")
                    stopNavigating()
                    window.location.href = "/create/"
                },
                "new entry": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now creating a new entry")
                    stopNavigating()
                    window.location.href = "/create/"
                },
                "add entry": () => {
                    sessionStorage.setItem("voiceFeedback", "You are now adding a new entry")
                    stopNavigating()
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
                    commands[match]()
                } else {
                    console.log("Voice nav: no command matched for →", said)
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