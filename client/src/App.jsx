import React, { useState, useEffect } from "react";
import mqtt from "mqtt";

function App() {
  const [lightState, setLightState] = useState(false);
  const [lightColor, setLightColor] = useState("None");
  const [motorSpeed, setMotorSpeed] = useState(0); // 0: off, 1: speed 1, 2: speed 2, 3: speed 3
  const [status, setStatus] = useState("");

  useEffect(() => {
    // MQTT Broker configuration using environment variables
    const client = mqtt.connect(import.meta.env.VITE_MQTT_BROKER_URL, {
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
    });

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe("/light");
      client.subscribe("/motor");
      client.subscribe("/getstatus");
    });

    client.on("message", (topic, message) => {
      if (topic === "/getstatus") {
        setStatus(message.toString());
      }
    });

    // Cleanup when the component unmounts
    return () => {
      client.end();
    };
  }, []);

  const toggleLight = () => {
    const newState = !lightState;
    setLightState(newState);
    const message = newState ? "1" : "0"; // Turn on/off light
    publishToMqtt("/light", message);
  };

  const changeLightColor = (color) => {
    setLightColor(color);
    publishToMqtt("/light", color); // Publish color change
  };

  const changeMotorSpeed = (speed) => {
    setMotorSpeed(speed);
    const message = speed.toString(); // Set motor speed
    publishToMqtt("/motor", message); // Motor will automatically be ON when speed is set to 1, 2, or 3
  };

  const publishToMqtt = (topic, message) => {
    const client = mqtt.connect(import.meta.env.VITE_MQTT_BROKER_URL, {
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
    });
    client.publish(topic, message);
    client.end();
  };

  const getStatus = () => {
    publishToMqtt("/getstatus", "");
  };

  return (
    <div
      className='min-h-screen flex flex-col justify-center items-center bg-gray-200 p-6'
      style={{ fontFamily: "Inter, sans-serif" }}
    >
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
          <button
            onClick={toggleLight}
            className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 ${
              lightState
                ? "bg-gradient-to-r from-red-600 to-red-400"
                : "bg-gradient-to-r from-green-600 to-green-400"
            }`}
          >
            {lightState ? "Turn Off Light" : "Turn On Light"}
          </button>
        </div>

        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-gray-700 mb-3'>
            Change Light Color
          </h2>
          <div className='grid grid-cols-3 gap-4'>
            <button
              onClick={() => changeLightColor("1")}
              className='w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-red-600 to-red-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300'
            >
              Red
            </button>
            <button
              onClick={() => changeLightColor("2")}
              className='w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300'
            >
              Blue
            </button>
            <button
              onClick={() => changeLightColor("3")}
              className='w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-green-600 to-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-300'
            >
              Green
            </button>
          </div>
        </div>

        {/* Motor Speed Control */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-gray-700 mb-3'>
            Adjust Motor Speed
          </h2>
          <div className='flex items-center justify-center gap-4'>
            {/* Speed 0 (Off) */}
            <button
              onClick={() => changeMotorSpeed(0)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-gray-500 to-gray-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300 ${
                motorSpeed === 0 ? "scale-110" : ""
              }`}
            >
              Off
            </button>
            {/* Speed 1 */}
            <button
              onClick={() => changeMotorSpeed(1)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-red-600 to-red-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ${
                motorSpeed === 1 ? "scale-110" : ""
              }`}
            >
              1
            </button>
            {/* Speed 2 */}
            <button
              onClick={() => changeMotorSpeed(2)}
              className={`w-20 h-20 flex justify-center items-center bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-full font-semibold text-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ${
                motorSpeed === 2 ? "scale-110" : ""
              }`}
            >
              2
            </button>
            {/* Speed 3 */}
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

        {/* Status Display */}
        <div className='mb-6'>
          <h2 className='text-2xl font-semibold text-gray-700 mb-3'>
            Current Status
          </h2>
          <p className='text-lg text-gray-800'>{status}</p>
          <button
            onClick={getStatus}
            className='mt-4 w-full py-3 text-white font-semibold bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300'
          >
            Get Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
