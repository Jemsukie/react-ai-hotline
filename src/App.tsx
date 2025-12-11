import { useState, useRef, useEffect } from 'react'
import { RetellWebClient } from 'retell-client-js-sdk'
import './index.css'

function App() {
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState('Idle')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const wsRef = useRef<WebSocket | null>(null)
  const retellClientRef = useRef<RetellWebClient | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkBackend = async () => {
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        })
        if (response.ok) {
          setBackendStatus('online')
        } else {
          setBackendStatus('offline')
        }
      } catch (error) {
        setBackendStatus('offline')
      }
    }

    // Check immediately
    checkBackend()

    // Check every 5 seconds
    const interval = setInterval(checkBackend, 5000)

    return () => clearInterval(interval)
  }, [])

  const startCall = async () => {
    try {
      setStatus('Requesting microphone...')

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      setStatus('Creating Retell session...')

      // Start Retell session via backend API
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'
      const response = await fetch(`${apiBaseUrl}/api/retell/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Backend error:', errorData)
        if (errorData.availableKeys) {
          console.error('Available keys in Retell response:', errorData.availableKeys)
          console.error('Full Retell response:', JSON.stringify(errorData.response, null, 2))
          // Show user-friendly error with available keys
        throw new Error(
          `Retell API returned unexpected format. Available keys: ${errorData.availableKeys.join(', ')}. ` +
          'Check browser console for full response.'
        )
        }
        throw new Error(errorData.error || errorData.message || 'Failed to start Retell session')
      }

      const data = await response.json()
      const { clientToken, accessToken, wsUrl } = data

      setStatus('Connecting...')

      // Use Retell Web Client SDK if accessToken/clientToken is available (newer API)
      const token = accessToken || clientToken
      if (token) {
        console.log('Using Retell Web Client SDK with accessToken')
        const retellClient = new RetellWebClient()
        retellClientRef.current = retellClient

        // Set up event listeners
        retellClient.on('call_started', () => {
          setIsConnected(true)
          setStatus('Connected to Jemwealth AI')
          console.log('Call started')
        })

        retellClient.on('call_ended', () => {
          setIsConnected(false)
          setStatus('Call ended')
          cleanup()
        })

        retellClient.on('agent_start_talking', () => {
          console.log('Agent started talking')
        })

        retellClient.on('agent_stop_talking', () => {
          console.log('Agent stopped talking')
        })

        retellClient.on('error', (error: any) => {
          console.error('Retell client error:', error)
          setStatus('Connection error')
          cleanup()
        })

        retellClient.on('update', (update: any) => {
          if (update.transcript) {
            // console.log('AI said:', update.transcript)
          }
        })

        // Start call with accessToken
        await retellClient.startCall({
          accessToken: token,
        })

        return // Exit early, SDK handles everything
      }

      // Fallback to WebSocket if wsUrl is available (older API)
      if (!wsUrl) {
        throw new Error('No clientToken or WebSocket URL received from Retell')
      }

      console.log('Using WebSocket connection')
      // Connect to Retell WebSocket
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // Set up audio context for processing
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      // Create audio element for playback
      const audioElement = new Audio()
      audioElementRef.current = audioElement

      ws.onopen = () => {
        setIsConnected(true)
        setStatus('Connected to Jemwealth AI')
        console.log('Connected to Retell AI')

        // Start sending audio data
        const source = audioContext.createMediaStreamSource(stream)
        const processor = audioContext.createScriptProcessor(4096, 1, 1)

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0)
            const pcmData = new Int16Array(inputData.length)
            for (let i = 0; i < inputData.length; i++) {
              pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
            }
            // Send audio data to Retell (format may vary based on Retell's requirements)
            ws.send(JSON.stringify({
              type: 'audio',
              data: Array.from(pcmData),
            }))
          }
        }

        source.connect(processor)
        processor.connect(audioContext.destination)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Handle audio output from Retell
          if (data.audioOut) {
            const audioBlob = new Blob([Uint8Array.from(atob(data.audioOut), c => c.charCodeAt(0))], {
              type: 'audio/wav',
            })
            const audioUrl = URL.createObjectURL(audioBlob)
            audioElement.src = audioUrl
            audioElement.play()
          }

          // Handle transcript
          if (data.transcript) {
            // console.log('AI said:', data.transcript)
          }

          // Handle status updates
          if (data.status) {
            setStatus(data.status)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('Connection error')
      }

      ws.onclose = () => {
        setIsConnected(false)
        setStatus('Disconnected')
        cleanup()
      }
    } catch (error) {
      console.error('Error starting call:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setStatus('Error: Backend server not running. Please start it with "yarn backend"')
      } else {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      cleanup()
    }
  }

  const endCall = () => {
    // Stop Retell Web Client if using SDK
    if (retellClientRef.current) {
      retellClientRef.current.stopCall()
      retellClientRef.current = null
    }
    // Close WebSocket if using direct connection
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    cleanup()
    setIsConnected(false)
    setStatus('Call ended')
  }

  const cleanup = () => {
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Clean up audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current.src = ''
      audioElementRef.current = null
    }
  }

  const handleButtonClick = () => {
    if (isConnected) {
      endCall()
    } else {
      startCall()
    }
  }

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center bg-base-100 gap-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🎙️ Jemwealth AI Hotline</h1>
        <p className="text-lg text-base-content/70">{status}</p>

        {/* Backend Status Indicator */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className={`badge badge-sm ${
            backendStatus === 'online'
              ? 'badge-success'
              : backendStatus === 'offline'
              ? 'badge-error'
              : 'badge-warning'
          }`}>
            {backendStatus === 'online' && '🟢 Backend Online'}
            {backendStatus === 'offline' && '🔴 Backend Offline'}
            {backendStatus === 'checking' && '🟡 Checking...'}
          </div>
          {backendStatus === 'offline' && (
            <span className="text-xs text-error">
              Run: <code className="bg-base-200 px-1 rounded">yarn backend</code>
            </span>
          )}
        </div>
      </div>
      <button
        onClick={handleButtonClick}
        className={`btn btn-lg ${isConnected ? 'btn-error' : 'btn-primary'}`}
        disabled={backendStatus === 'offline'}
      >
        {isConnected ? '📞 Hang Up' : '📞 Start Call'}
      </button>
    </div>
  )
}

export default App
