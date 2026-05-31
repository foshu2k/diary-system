document.addEventListener("DOMContentLoaded", function () {

    // Voice Command
    const voiceNavBtn = document.getElementById("micNavBtn")

    // Speech to Text
    const speechBtn = document.getElementById("micBtn")
    const clearBtn = document.getElementById("clearBtn")
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    // Pages Feedback Map
    const pages = {
        "/": "You are at the home page.",
        "/accounts/profile/": "You are at the profile page.",
        "/entrylist/": "You are at the entry list page.",
        "/create/": "You are at the entry creation page.",
    }

    // Feedback
    const voiceFeedback = () => {
        if (sessionStorage.getItem("voiceNavTriggered") !== "true") return;

        const text = pages[window.location.pathname] || "Page loaded."
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))

        sessionStorage.removeItem("voiceNavTriggered")
    }

    window.addEventListener("pageshow", () => {
        voiceFeedback()
    })

    // Voice Command Functionality
    if (voiceNavBtn) {
        const micNavIcon = document.getElementById("micNavIcon")

        if (!SpeechRecognition) {
            voiceNavBtn.disabled = true
        } else {
            let isNavigating = false
            let navObj = null

            const commands = {
                "go home": () => window.location.href = "/",
                "go to home": () => window.location.href = "/",
                "go back": () => {
                    sessionStorage.setItem("voiceNavTriggered", "true")
                    window.history.back()
                },
                "go forward": () => {
                    sessionStorage.setItem("voiceNavTriggered", "true")
                    window.history.forward()
                },
                "go to profile": () => window.location.href = "/accounts/profile/",
                "go to entries": () => window.location.href = "/entrylist/",
                "go to entry list": () => window.location.href = "/entrylist/",
                "view entries": () => window.location.href = "/entrylist/",
                "view all entries": () => window.location.href = "/entrylist/",
                "create entry": () => window.location.href = "/create/",
                "new entry": () => window.location.href = "/create/",
                "add entry": () => window.location.href = "/create/",
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
                showVoicePopup()
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
                hideVoicePopup()
                if (navObj) {
                    navObj.stop()
                    navObj = null
                }
            }
        }
    }

    function showVoicePopup() {
        const p = document.getElementById("voicePopup")
        if (!p) return
        p.hidden = false
        requestAnimationFrame(() => p.classList.add("is-open"))
    }

    function hideVoicePopup() {
        const p = document.getElementById("voicePopup")
        if (!p) return
        p.classList.remove("is-open")
        setTimeout(() => { p.hidden = true }, 180)
    }

    // Speech to Text Functionality
    if (speechBtn) {
        const micIcon = document.getElementById("micIcon")
        const outputField = document.getElementById("id_content")
        const canvas = document.getElementById("waveformCanvas")
        const ctx = canvas ? canvas.getContext("2d") : null

        // --- Waveform Setup ---
        let audioCtx = null
        let analyser = null
        let animFrameId = null
        let mediaStream = null

        function resizeCanvas() {
            if (!canvas) return
            canvas.width = canvas.offsetWidth
            canvas.height = canvas.offsetHeight
        }

        function drawIdle() {
            if (!ctx || !canvas) return
            resizeCanvas()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            const centerY = canvas.height / 2
            ctx.fillStyle = "#E491A7"
            ctx.fillRect(0, centerY - 1, canvas.width, 2)
        }

        function drawLive() {
            if (!analyser || !ctx || !canvas) return
            animFrameId = requestAnimationFrame(drawLive)

            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)
            analyser.getByteFrequencyData(dataArray)

            resizeCanvas()
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const barWidth = 2
            const gap = 4
            const totalBars = Math.floor(canvas.width / (barWidth + gap))
            const centerY = canvas.height / 2
            const centerX = canvas.width / 2
            const maxH = canvas.height * 0.9
            const halfBars = Math.floor(totalBars / 2)

            ctx.fillStyle = "#E491A7"
            for (let i = 0; i < halfBars; i++) {
                const dataIndex = Math.floor((i / halfBars) * bufferLength)
                const amplitude = dataArray[dataIndex] / 255
                const minH = 4
                const h = minH + amplitude * (maxH - minH)

                // Right side
                const xRight = centerX + i * (barWidth + gap)
                ctx.fillRect(xRight, centerY - h / 2, barWidth, h)

                // Left side (mirror)
                const xLeft = centerX - i * (barWidth + gap) - barWidth
                ctx.fillRect(xLeft, centerY - h / 2, barWidth, h)
            }
        }

        function stopWaveform() {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId)
                animFrameId = null
            }
            if (mediaStream) {
                mediaStream.getTracks().forEach(t => t.stop())
                mediaStream = null
            }
            if (audioCtx) {
                audioCtx.close()
                audioCtx = null
                analyser = null
            }
            drawIdle()
        }

        async function startWaveform() {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
                audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                analyser = audioCtx.createAnalyser()
                analyser.fftSize = 256
                const source = audioCtx.createMediaStreamSource(mediaStream)
                source.connect(analyser)

                drawLive()
            } catch (err) {
                console.warn("Waveform mic access failed:", err)
                drawIdle()
            }
        }

        // Draw idle state on load
        drawIdle()
        window.addEventListener("resize", () => {
            if (!animFrameId) drawIdle()
        })

        // --- Speech Recognition ---
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
                    outputField.value = ""
                })
            }

            function startRecording() {
                micIcon.src = "/static/entries/svg/mic-recording.svg"
                startWaveform()

                speechObj = new SpeechRecognition()
                speechObj.continuous = true
                speechObj.interimResults = false
                speechObj.start()
                speechObj.onresult = transcribe
            }

            function transcribe(e) {
                const transcript = e.results[e.results.length - 1][0].transcript
                outputField.value += transcript + " "
            }

            function stopRecording() {
                micIcon.src = "/static/entries/svg/mic-idle.svg"
                stopWaveform()
                if (speechObj) {
                    speechObj.stop()
                    speechObj = null
                }
            }
        }
    }
})