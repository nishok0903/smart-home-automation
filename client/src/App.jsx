import { useState, useEffect, } from "react"
import React from 'react';


import mqtt from "mqtt"

function App() {
  const [lightState, setLightState] = useState(false)
  const [lightColor, setLightColor] = useState("None")
  const [lightIntensity, setLightIntensity] = useState(100)
  const [motorSpeed, setMotorSpeed] = useState(0)
  const [status, setStatus] = useState("")
  const [client, setClient] = useState(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [darkTheme, setDarkTheme] = useState(true)
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    // MQTT Broker configuration using environment variables
    const mqttClient = mqtt.connect("wss://0c6a92febc6b4714919a796026caa7c7.s1.eu.hivemq.cloud:8884/mqtt", {
      username: "HomeAutomationController",
      password: "StrongPassword1$$",
    })

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker")
      mqttClient.subscribe("/light")
      mqttClient.subscribe("/motor")
      mqttClient.subscribe("/getstatus")
      mqttClient.subscribe("/status");
      setIsConnecting(false)
    })

    mqttClient.publish("/getstatus","h");
    
    mqttClient.on("message", (topic, message) => {
      if (topic === "/status") {
        console.log("HERE");
        const [led, motor, intensity] = message.toString().split(" ");
        console.log(led, motor, intensity);
        
        if(led=="0")
        {
          setLightColor("None");setLightState(false);
        }
        else
        {
          setLightColor(led);
          setLightState(true);
        }

        setMotorSpeed(Number(motor));
        setLightIntensity(Math.round(Number(intensity) / 255 * 100));   
          
       
      }
    });
    

    // Store the client so it can be used elsewhere
    setClient(mqttClient)

    // Cleanup when the component unmounts
    return () => {
      mqttClient.end()
    }
  }, [])

  const toggleLight = async() => {
    const newState = !lightState
    setLightState(newState)
    const message = newState ? "1" : "0"
    if (client) {
      client.publish("/light", message)
      //Here I want little delay before the next publish works
      await delay(250); // 500ms delay
      client.publish("/getstatus","h");
    }
  }

  const changeLightColor = async(color) => {
    setLightColor(color)
    if (client) {
      client.publish("/light", color)
      await delay(250); // 500ms delay
      client.publish("/getstatus","h");
    }
  }

  const changeMotorSpeed = async(speed) => {
    setMotorSpeed(speed)
    const message = speed.toString()
    if (client) {
      client.publish("/motor", message)
      await delay(250); // 500ms delay
      client.publish("/getstatus","h");
    }
  }

  const changeLightIntensity = async(intensity) => {
    const convertedIntensity = Math.round((intensity / 100) * (255 - 1) + 1);
    setLightIntensity(intensity);
    if (client && lightState) {
      client.publish("/intensity", convertedIntensity.toString());
      await delay(250); // 500ms delay
      client.publish("/getstatus","h");
    }
  }
  

  const toggleTheme = () => {
    setDarkTheme(!darkTheme)
  }

  // Get color for light visualization
  const getLightColor = () => {
    switch (lightColor) {
      case "1":
        return "#ff5555"
      case "2":
        return "#5599ff"
      case "3":
        return "#55dd55"
      default:
        return "#ffcc44"
    }
  }

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center p-6 ${
        darkTheme
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-gray-100"
          : "bg-gradient-to-br from-gray-100 via-slate-100 to-gray-200 text-gray-800"
      }`}
    >
      {/* Background animated pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 ${darkTheme ? "opacity-10" : "opacity-5"}`}>
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={darkTheme ? "white" : "black"} strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div
        className={`max-w-xl w-full ${
          darkTheme ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } shadow-2xl rounded-2xl overflow-hidden border backdrop-blur-sm bg-opacity-80 relative z-10`}
      >
        {/* Header with animated gradient */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-800 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,0,255,0.2),transparent_70%)]"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-center text-white tracking-wider">SMART HOME</h1>
            </div>

            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              {darkTheme ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Status Indicator */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${darkTheme ? "text-gray-400" : "text-gray-500"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className={`text-sm ${darkTheme ? "text-gray-400" : "text-gray-500"}`}>
                Status: {status || "No status"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {isConnecting ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
                  <span className={`text-sm ${darkTheme ? "text-gray-400" : "text-gray-500"}`}>Connecting...</span>
                </div>
              ) : client ? (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                  <span className={`text-sm ${darkTheme ? "text-gray-400" : "text-gray-500"}`}>Connected</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className={`text-sm ${darkTheme ? "text-gray-400" : "text-gray-500"}`}>Disconnected</span>
                </div>
              )}
            </div>
          </div>

          {/* Light Control */}
          <div
            className={`${darkTheme ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"} p-6 rounded-xl shadow-inner border relative overflow-hidden group transition-all duration-300 ${darkTheme ? "hover:border-indigo-900" : "hover:border-indigo-300"}`}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h2 className={`text-2xl font-semibold ${darkTheme ? "text-gray-100" : "text-gray-800"}`}>
                  Light Control
                </h2>
              </div>

              {/* Light visualization */}
              {lightState && (
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: getLightColor(),
                      boxShadow: `0 0 ${lightIntensity / 5}px ${lightIntensity / 10}px ${getLightColor()}`,
                      opacity: lightIntensity / 100,
                    }}
                  ></div>
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{
                      backgroundColor: getLightColor(),
                      opacity: 0.2,
                      animationDuration: "3s",
                    }}
                  ></div>
                </div>
              )}
            </div>

            <button
              onClick={toggleLight}
              className={`w-full py-4 text-white font-semibold rounded-lg transition-all duration-500 shadow-lg relative overflow-hidden group ${
                lightState
                  ? "bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                  : "bg-gradient-to-r from-emerald-900 to-emerald-700 hover:from-emerald-800 hover:to-emerald-600"
              }`}
            >
              <div className="absolute inset-0 w-full h-full">
                <div
                  className={`absolute inset-0 opacity-20 transition-opacity duration-1000 ${lightState ? "opacity-0" : "opacity-20"}`}
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#lightPattern)" />
                  </svg>
                  <defs>
                    <pattern id="lightPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                      <circle cx="5" cy="5" r="1" fill="white" />
                    </pattern>
                  </defs>
                </div>
              </div>
              <span className="relative z-10 flex items-center justify-center">
                {lightState ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    Turn Off Light
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Turn On Light
                  </>
                )}
              </span>
            </button>

            {/* Light Intensity Slider - Only visible when light is on */}
            {lightState && (
              <div className="mt-6 relative z-10 transition-all duration-500 ease-in-out">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                      />
                    </svg>
                    <label className={`text-sm font-medium ${darkTheme ? "text-gray-300" : "text-gray-700"}`}>
                      Intensity
                    </label>
                  </div>
                  <span className={`text-sm font-medium ${darkTheme ? "text-gray-300" : "text-gray-700"}`}>
                    {lightIntensity}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightIntensity}
                    onChange={(e) => changeLightIntensity(Number.parseInt(e.target.value))}
                    className={`w-full h-2 ${darkTheme ? "bg-gray-700" : "bg-gray-200"} rounded-lg appearance-none cursor-pointer accent-blue-600`}
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${lightIntensity}%, ${darkTheme ? "#374151" : "#e5e7eb"} ${lightIntensity}%, ${darkTheme ? "#374151" : "#e5e7eb"} 100%)`,
                    }}
                  />
                  <div className={`flex justify-between text-xs ${darkTheme ? "text-gray-500" : "text-gray-400"} mt-1`}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Light Color Selection - Only visible when light is on */}
            {lightState && (
              <div className="mt-6 relative z-10 transition-all duration-500 ease-in-out">
                <div className="flex items-center space-x-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                  <h3 className={`text-lg font-medium ${darkTheme ? "text-gray-300" : "text-gray-700"} mb-3`}>
                    Light Color
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => changeLightColor("1")}
                    className={`group relative w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 shadow-md overflow-hidden ${
                      lightColor === "1"
                        ? `ring-2 ring-red-500 ring-offset-2 ${darkTheme ? "ring-offset-gray-900" : "ring-offset-gray-50"}`
                        : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      Red
                    </div>
                  </button>
                  <button
                    onClick={() => changeLightColor("2")}
                    className={`group relative w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md overflow-hidden ${
                      lightColor === "2"
                        ? `ring-2 ring-blue-500 ring-offset-2 ${darkTheme ? "ring-offset-gray-900" : "ring-offset-gray-50"}`
                        : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      Blue
                    </div>
                  </button>
                  <button
                    onClick={() => changeLightColor("3")}
                    className={`group relative w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-green-900 to-green-700 hover:from-green-800 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 shadow-md overflow-hidden ${
                      lightColor === "3"
                        ? `ring-2 ring-green-500 ring-offset-2 ${darkTheme ? "ring-offset-gray-900" : "ring-offset-gray-50"}`
                        : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      Green
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fan Control (previously Motor Speed) */}
          <div
            className={`${darkTheme ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"} p-6 rounded-xl shadow-inner border relative overflow-hidden group transition-all duration-300 ${darkTheme ? "hover:border-indigo-900" : "hover:border-indigo-300"}`}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                
                <h2 className={`text-2xl font-semibold ${darkTheme ? "text-gray-100" : "text-gray-800"}`}>
                  Living Room Fan
                </h2>
              </div>

              {/* Fan speed visualization */}
              {motorSpeed > 0 && (
                <div className="relative">
                  <div className={`text-lg font-semibold ${darkTheme ? "text-gray-300" : "text-gray-700"}`}>
                    Speed: {motorSpeed}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => changeMotorSpeed(motorSpeed > 0 ? 0 : 1)}
              className={`w-full py-4 text-white font-semibold rounded-lg transition-all duration-500 shadow-lg relative overflow-hidden group ${
                motorSpeed > 0
                  ? "bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                  : "bg-gradient-to-r from-emerald-900 to-emerald-700 hover:from-emerald-800 hover:to-emerald-600"
              }`}
            >
              <div className="absolute inset-0 w-full h-full">
                <div
                  className={`absolute inset-0 opacity-20 transition-opacity duration-1000 ${motorSpeed > 0 ? "opacity-0" : "opacity-20"}`}
                >
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#fanPattern)" />
                  </svg>
                  <defs>
                    <pattern id="fanPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                      <circle cx="5" cy="5" r="1" fill="white" />
                    </pattern>
                  </defs>
                </div>
              </div>
              <span className="relative z-10 flex items-center justify-center">
                {motorSpeed > 0 ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                    Turn Off Fan
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    Turn On Fan
                  </>
                )}
              </span>
            </button>

            {/* Fan Speed Selection - Only visible when fan is on */}
            {motorSpeed > 0 && (
              <div className="mt-6 relative z-10 transition-all duration-500 ease-in-out">
                <div className="flex items-center space-x-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className={`text-lg font-medium ${darkTheme ? "text-gray-300" : "text-gray-700"} mb-3`}>
                    Fan Speed
                  </h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Speed 1 */}
                  <button
                    onClick={() => changeMotorSpeed(1)}
                    className={`group flex-1 py-4 flex flex-col justify-center items-center bg-gradient-to-r from-amber-900 to-amber-700 hover:from-amber-800 hover:to-amber-600 text-white rounded-xl font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 shadow-md relative overflow-hidden ${
                      motorSpeed === 1 ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-900" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-amber-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {motorSpeed === 1 && (
                        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                          <div
                            className="w-8 h-8 rounded-full bg-amber-500 opacity-10 animate-ping"
                            style={{ animationDuration: "3s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <span>1</span>
                    <span className="text-xs mt-1">Low</span>
                  </button>

                  {/* Speed 2 */}
                  <button
                    onClick={() => changeMotorSpeed(2)}
                    className={`group flex-1 py-4 flex flex-col justify-center items-center bg-gradient-to-r from-orange-900 to-orange-700 hover:from-orange-800 hover:to-orange-600 text-white rounded-xl font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 shadow-md relative overflow-hidden ${
                      motorSpeed === 2 ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-gray-900" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {motorSpeed === 2 && (
                        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                          <div
                            className="w-8 h-8 rounded-full bg-orange-500 opacity-10 animate-ping"
                            style={{ animationDuration: "2s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <span>2</span>
                    <span className="text-xs mt-1">Medium</span>
                  </button>

                  {/* Speed 3 */}
                  <button
                    onClick={() => changeMotorSpeed(3)}
                    className={`group flex-1 py-4 flex flex-col justify-center items-center bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white rounded-xl font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 shadow-md relative overflow-hidden ${
                      motorSpeed === 3 ? "ring-2 ring-red-500 ring-offset-2 ring-offset-gray-900" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      {motorSpeed === 3 && (
                        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                          <div
                            className="w-8 h-8 rounded-full bg-red-500 opacity-10 animate-ping"
                            style={{ animationDuration: "1s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <span>3</span>
                    <span className="text-xs mt-1">High</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${darkTheme ? "bg-gray-900 border-gray-700 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-500"} p-4 text-center text-sm border-t relative overflow-hidden`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${darkTheme ? "from-purple-900/10 to-indigo-900/10" : "from-purple-100/30 to-indigo-100/30"}`}
          ></div>
          <div className="relative z-10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 mr-2 ${darkTheme ? "text-indigo-400" : "text-indigo-500"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Smart Home Automation Controller
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

