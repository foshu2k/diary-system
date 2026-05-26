document.addEventListener("DOMContentLoaded", function () {

    // Voice Command Elements
    const voiceNavBtn = document.getElementById("micNavBtn")

    // Speech to Text Elements
    const speechBtn = document.getElementById("micBtn")
    const clearBtn = document.getElementById("clearBtn")
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    // Feedback System using SpeechSynthesis
    const voiceFeedback = () => {
        let text = sessionStorage.getItem("voiceNavFeedback");
        if (text) {
            // Cancel any speech that might still be playing from a previous page load
            window.speechSynthesis.cancel(); 

            const voice = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(voice);
            sessionStorage.removeItem("voiceNavFeedback");
        }
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

            // Helper to speak a confirmation before changing pages
            const speakAndNavigate = (feedbackText, targetUrl) => {
                window.speechSynthesis.cancel(); // Stop any current speech
                const utterance = new SpeechSynthesisUtterance(feedbackText);
                
                // Wait for the browser to finish speaking before redirecting
                utterance.onend = () => {
                    window.location.href = targetUrl;
                };
                
                window.speechSynthesis.speak(utterance);
            };

            const commands = {
                "go home": () => {
                    // Option A: Use the tutorial style to speak immediately before redirecting
                    speakAndNavigate("Navigating to home page.", "/");
                },
                "go to home": () => speakAndNavigate("Going home.", "/"),
                "go back": () => {
                    window.speechSynthesis.cancel();
                    window.history.back();
                },
                "go forward": () => {
                    window.speechSynthesis.cancel();
                    window.history.forward();
                },
                "go to profile": () => speakAndNavigate("Opening your profile.", "/profile/"),
                "go to entries": () => speakAndNavigate("Opening entries.", "/entrylist/"),
                "go to entry list": () => speakAndNavigate("Opening entry list.", "/entrylist/"),
                "view entries": () => speakAndNavigate("Viewing entries.", "/entrylist/"),
                "view all entries": () => speakAndNavigate("Viewing all entries.", "/entrylist/"),
                "create entry": () => speakAndNavigate("Creating a new entry.", "/create/"),
                "new entry": () => speakAndNavigate("Opening new entry form.", "/create/"),
                "add entry": () => speakAndNavigate("Adding an entry.", "/create/"),
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

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (isRecording) {
                        stopRecording()
                        isRecording = false
                    }
                    
                    // From Tutorial: Cut off any TTS talking when user explicitly hits clear
                    window.speechSynthesis.cancel(); 
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