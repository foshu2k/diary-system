document.addEventListener("DOMContentLoaded", function () {
    const speechBtn = document.getElementById("micBtn")
    const navBtn = document.getElementById("navMicBtn")
    const micIcon = document.getElementById("micIcon")
    const navMicIcon = document.getElementById("navMicIcon")
    const outputField = document.getElementById("id_content")

    const navCommands = {
        "go home": "/",
        "go to home": "/",
        "go list": "/entrylist/",
        "go to list": "/entrylist/",
        "go to all entries": "/entrylist/",
        "view all entries": "/entrylist/",
        "go back": () => history.back(),
        "go forward": () => history.forward(),
        "new entry": "/create/",
        "create entry": "/create/",
        "add entry": "/create/",
    }

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

    // Voice Navigation
    let isNavigating = false
    let navObj = null

    navBtn.addEventListener("click", () => {
        isNavigating = !isNavigating
        isNavigating ? startNavListening() : stopNavListening()
    })

    function startNavListening() {
        navMicIcon.src = "/static/entries/svg/mic-recording.svg"

        navObj = new SpeechRecognition()
        navObj.continuous = false
        navObj.interimResults = false
        navObj.onresult = (e) => {
            const transcript = e.results[0][0].transcript.trim().toLowerCase()
            handleNavCommand(transcript)
        }
        navObj.onend = stopNavListening
        navObj.start()
    }

    function stopNavListening() {
        navMicIcon.src = "/static/entries/svg/mic-idle.svg"
        isNavigating = false
        if (navObj) {
            navObj.stop()
            navObj = null
        }
    }

    function handleNavCommand(transcript) {
        for (const [phrase, target] of Object.entries(navCommands)) {
            if (transcript.includes(phrase)) {
                stopNavListening()
                typeof target === "function" ? target() : window.location.href = target
                return
            }
        }
    }
})