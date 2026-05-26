// Voice Feature (Safari/Chrome)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

document.addEventListener("DOMContentLoaded", function () {

    // Global reusable text-to-speech engine
    function speak(text) {
        if (!SpeechSynthesis || !text) return;
        SpeechSynthesis.cancel(); // Stop any currently playing audio track
        const voice = new SpeechSynthesisUtterance(text);
        SpeechSynthesis.speak(voice);
    }

    // Replace your old voiceFeedback function with this updated version:
    const voiceFeedback = () => {
        let customFeedback = sessionStorage.getItem("voiceNavFeedback");
    
        // Safety check: force clear any frozen speech queues
        if (SpeechSynthesis) {
            SpeechSynthesis.cancel();
        }

        if (customFeedback) {
            speak(customFeedback);
            sessionStorage.removeItem("voiceNavFeedback");
        } else {
            const currentPage = document.body.getAttribute("data-page-name") || "a new page";
            speak(`You have landed on the ${currentPage}`);
        }
    }

    // Trigger feedback instantly on page render
    voiceFeedback();


    // ==========================================
    // VOICE COMMAND NAVIGATION
    // ==========================================
    const voiceNavBtn = document.getElementById("micNavBtn");

    if (voiceNavBtn) {
        const micNavIcon = document.getElementById("micNavIcon");

        if (!SpeechRecognition) {
            voiceNavBtn.disabled = true;
        } else {
            let isNavigating = false;
            let navObj = null;

            // Helper to clean up redirects and stage voice announcements
            const navigateTo = (url, feedbackText) => {
                sessionStorage.setItem("voiceNavFeedback", feedbackText);
                window.location.href = url;
            };

            const commands = {
                "go home": () => navigateTo(document.body.getAttribute("data-url-home"), "You are at the home page."),
                "go to home": () => navigateTo(document.body.getAttribute("data-url-home"), "Returning home."),
                "go back": () => {
                    sessionStorage.setItem("voiceNavFeedback", "Going back a page.");
                    window.history.back();
                },
                "go forward": () => {
                    sessionStorage.setItem("voiceNavFeedback", "Going forward a page.");
                    window.history.forward();
                },
                "go to profile": () => navigateTo("/profile/", "Opening your profile."), // Keep if profile matches
                "go to entries": () => navigateTo(document.body.getAttribute("data-url-entries"), "Loading your entry list."),
                "go to entry list": () => navigateTo(document.body.getAttribute("data-url-entries"), "Loading your entry list."),
                "view entries": () => navigateTo(document.body.getAttribute("data-url-entries"), "Displaying entries."),
                "view all entries": () => navigateTo(document.body.getAttribute("data-url-entries"), "Displaying all entries."),
                "create entry": () => navigateTo(document.body.getAttribute("data-url-create"), "Opening new entry creator."),
                "new entry": () => navigateTo(document.body.getAttribute("data-url-create"), "Opening new entry creator."),
                "add entry": () => navigateTo(document.body.getAttribute("data-url-create"), "Opening new entry creator."),
            };

            voiceNavBtn.addEventListener("click", () => {
                isNavigating = !isNavigating;
                if (isNavigating) {
                    startNavigating();
                } else {
                    stopNavigating();
                }
            });

            function startNavigating() {
                micNavIcon.src = "/static/entries/svg/mic-recording.svg";
                navObj = new SpeechRecognition();
                navObj.start();
                navObj.onresult = handleCommand;
                
                // Reset state cleanly if microphone times out naturally
                navObj.onend = () => {
                    if (isNavigating) stopNavigating();
                };
            }

            function handleCommand(e) {
                const last = e.results.length - 1;
                const said = e.results[last][0].transcript.trim().toLowerCase();

                const match = Object.keys(commands).find(cmd => said.includes(cmd));
                if (match) {
                    commands[match]();
                } else {
                    console.log("Voice nav: no command matched for →", said);
                    speak("Command not recognized.");
                }
            }

            function stopNavigating() {
                isNavigating = false;
                micNavIcon.src = "/static/entries/svg/mic-idle.svg";
                if (navObj) {
                    navObj.stop();
                    navObj = null;
                }
            }
        }
    }


    // ==========================================
    // SPEECH TO TEXT (FORM FIELD TRANSCRIPTION)
    // ==========================================
    const speechBtn = document.getElementById("micBtn");
    const clearBtn = document.getElementById("clearBtn");

    if (speechBtn) {
        const micIcon = document.getElementById("micIcon");
        const outputField = document.getElementById("id_content");

        if (!SpeechRecognition) {
            speechBtn.disabled = true;
        } else {
            let isRecording = false;
            let speechObj = null;

            speechBtn.addEventListener("click", () => {
                isRecording = !isRecording;
                if (isRecording) {
                    startRecording();
                } else {
                    stopRecording();
                }
            });

            if (clearBtn) {
                clearBtn.addEventListener("click", () => {
                    if (isRecording) {
                        stopRecording();
                        isRecording = false;
                    }
                    outputField.value = "";
                });
            }

            function startRecording() {
                micIcon.src = "/static/entries/svg/mic-recording.svg";
                speechObj = new SpeechRecognition();
                speechObj.start();
                speechObj.onresult = transcribe;
                
                speechObj.onend = () => {
                    if (isRecording) stopRecording();
                };
            }

            function transcribe(e) {
                const transcript = e.results[0][0].transcript;
                outputField.value += transcript + " ";
            }

            function stopRecording() {
                isRecording = false;
                micIcon.src = "/static/entries/svg/mic-idle.svg";
                if (speechObj) {
                    speechObj.stop();
                    speechObj = null;
                }
            }
        }
    }
});