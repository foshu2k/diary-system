// Voice Feature (Safari/Chrome)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

document.addEventListener("DOMContentLoaded", function () {

    // Global reusable text-to-speech engine
    function speak(text) {
        if (!SpeechSynthesis || !text) return;
        SpeechSynthesis.cancel(); // Clean the active pipeline
        const voice = new SpeechSynthesisUtterance(text);
        SpeechSynthesis.speak(voice);
    }

    const voiceFeedback = () => {
        let customFeedback = sessionStorage.getItem("voiceNavFeedback");
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

    // Trigger initial feedback
    voiceFeedback();

    // ==========================================
    // VOICE COMMAND NAVIGATION (SPA STYLED)
    // ==========================================
    const voiceNavBtn = document.getElementById("micNavBtn");

    if (voiceNavBtn) {
        const micNavIcon = document.getElementById("micNavIcon");

        if (!SpeechRecognition) {
            voiceNavBtn.disabled = true;
        } else {
            let isNavigating = false;
            let navObj = null;

            // SMART ROUTER: Fetches page content dynamically to preserve voice permissions
            const navigateTo = (url, feedbackText) => {
                if (!url) return;

                // 1. Speak immediately before the browser context changes!
                speak(feedbackText);

                // 2. Fetch the new HTML page background data
                fetch(url)
                    .then(response => response.text())
                    .then(html => {
                        // Create a temporary parser to scan the new page payload
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, "text/html");

                        // Find the core container in current page and new page
                        const targetContainer = document.querySelector(".app") || document.querySelector(".container");
                        const newContainer = doc.querySelector(".app") || doc.querySelector(".container");

                        if (targetContainer && newContainer) {
                            // Swap out the old view content seamlessly
                            targetContainer.innerHTML = newContainer.innerHTML;

                            // Update browser URL state history without dropping audio profiles
                            window.history.pushState({ path: url }, "", url);

                            // Update active page tracking text
                            const newPageName = doc.body.getAttribute("data-page-name") || "a new page";
                            document.body.setAttribute("data-page-name", newPageName);
                        } else {
                            // Fallback if containers don't align cleanly across unique standalone structures
                            sessionStorage.setItem("voiceNavFeedback", feedbackText);
                            window.location.href = url;
                        }
                    })
                    .catch(err => {
                        console.error("Failed handling voice navigation async swap:", err);
                        window.location.href = url; // Hard fallback route
                    });
            };

            const commands = {
                "go home": () => navigateTo(document.body.getAttribute("data-url-home"), "Going to the home page."),
                "go to home": () => navigateTo(document.body.getAttribute("data-url-home"), "Returning home."),
                "go back": () => {
                    speak("Going back a page.");
                    window.history.back();
                },
                "go forward": () => {
                    speak("Going forward a page.");
                    window.history.forward();
                },
                "go to entries": () => navigateTo(document.body.getAttribute("data-url-entries"), "Loading your entry list."),
                "go to entry list": () => navigateTo(document.body.getAttribute("data-url-entries"), "Loading your entry list."),
                "view entries": () => navigateTo(document.body.getAttribute("data-url-entries"), "Displaying your entry list."),
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
                if (outputField) {
                    outputField.value += transcript + " ";
                }
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