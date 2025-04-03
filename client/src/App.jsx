import React, { useState, useEffect } from "react";
import mqtt from "mqtt";

function App() {
  // States to manage the light and motor settings, and MQTT client connection
  const [lightState, setLightState] = useState(false); // Light on/off
  const [lightColor, setLightColor] = useState("None"); // Light color (Red, Green, Blue)
  const [motorSpeed, setMotorSpeed] = useState(0); // Motor speed (0: off, 1: low, 2: medium, 3: high)
  const [brightness, setBrightness] = useState(255); // Light brightness (1 to 255)
  const [client, setClient] = useState(null); // MQTT client to communicate with broker

  useEffect(() => {
    // Establish the connection with the MQTT broker
    const mqttClient = mqtt.connect(
      "wss://0c6a92febc6b4714919a796026caa7c7.s1.eu.hivemq.cloud:8884/mqtt",
      {
        username: "HomeAutomationController",
        password: "StrongPassword1$$",
      }
    );

    // Once connected to the MQTT broker
    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Subscribe to the topics to receive light and motor control updates (if required)
      mqttClient.subscribe("/light");
      mqttClient.subscribe("/motor");
    });

    // Store the MQTT client to communicate later in the app
    setClient(mqttClient);

    // Cleanup function to disconnect the MQTT client when the component unmounts
    return () => {
      mqttClient.end();
    };
  }, []); // This effect runs once on component mount

  // Function to toggle light state (on/off)
  const toggleLight = () => {
    const newLightState = !lightState; // Toggle the light state
    setLightState(newLightState);

    // Publish the new light state to the MQTT broker
    const message = newLightState ? "1" : "0"; // "1" for ON, "0" for OFF
    if (client) {
      client.publish("/light", message); // Send the light state to the broker
    }
  };

  // Function to change the light color
  const changeLightColor = (color) => {
    setLightColor(color);

    // Publish the selected color to the MQTT broker
    if (client) {
      client.publish("/light", color); // Send the selected color to the broker
    }
  };

  // Function to change the motor speed
  const changeMotorSpeed = (speed) => {
    setMotorSpeed(speed);

    // Publish the motor speed to the MQTT broker
    if (client) {
      client.publish("/motor", speed.toString()); // Send the motor speed to the broker
    }
  };

  // Function to handle the brightness slider change
  const handleBrightnessChange = (event) => {
    const newBrightness = event.target.value; // Get the new brightness value from the slider
    setBrightness(newBrightness);

    // Publish the new brightness value if the light is ON
    if (client && lightState) {
      client.publish("/intensity", newBrightness.toString()); // Send the brightness value to the broker
    }
  };

  return (
    <div className='min-h-screen flex flex-col justify-center items-center bg-gray-200 p-6'>
      <div className='max-w-xl w-full bg-white shadow-xl rounded-xl p-8'>
        <h1
          className='text-3xl font-bold text-center p-4'
          style={{ fontFamily: "Georgia, serif" }}
        >
          MQTT Light & Motor Control
        </h1>

        {/* Light Control */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-gray-700 mb-3'>
            Control Light
          </h2>

          {/* Buttons to toggle light color */}
          <div className='grid grid-cols-3 gap-4'>
            <button
              onClick={() => changeLightColor("1")}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
                lightColor === "1"
                  ? "scale-110 bg-gradient-to-r from-red-600 to-red-400"
                  : "bg-gradient-to-r from-red-600 to-red-400"
              }`}
            >
              Red
            </button>
            <button
              onClick={() => changeLightColor("2")}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
                lightColor === "2"
                  ? "scale-110 bg-gradient-to-r from-blue-600 to-blue-400"
                  : "bg-gradient-to-r from-blue-600 to-blue-400"
              }`}
            >
              Blue
            </button>
            <button
              onClick={() => changeLightColor("3")}
              className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
                lightColor === "3"
                  ? "scale-110 bg-gradient-to-r from-green-600 to-green-400"
                  : "bg-gradient-to-r from-green-600 to-green-400"
              }`}
            >
              Green
            </button>
          </div>

          {/* Brightness Slider (Only visible if light is ON) */}
          {lightState && (
            <div className='mt-4'>
              <h3 className='text-xl font-semibold text-gray-700 mb-2'>
                Set Brightness (1-255)
              </h3>
              <input
                type='range'
                min='1'
                max='255'
                value={brightness}
                onChange={handleBrightnessChange}
                className='w-full'
              />
              <p className='text-center text-gray-600'>{brightness}</p>
            </div>
          )}
        </div>

        {/* Motor Speed Control */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-gray-700 mb-3'>
            Adjust Motor Speed
          </h2>
          <div className='flex items-center justify-center gap-4'>
            {/* Motor Speed Buttons */}
            <button
              onClick={() => changeMotorSpeed(0)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-gray-500 to-gray-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300 ${
                motorSpeed === 0 ? "scale-110" : ""
              }`}
            >
              Off
            </button>
            <button
              onClick={() => changeMotorSpeed(1)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-red-600 to-red-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ${
                motorSpeed === 1 ? "scale-110" : ""
              }`}
            >
              1
            </button>
            <button
              onClick={() => changeMotorSpeed(2)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ${
                motorSpeed === 2 ? "scale-110" : ""
              }`}
            >
              2
            </button>
            <button
              onClick={() => changeMotorSpeed(3)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-green-600 to-green-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300 ${
                motorSpeed === 3 ? "scale-110" : ""
              }`}
            >
              3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
