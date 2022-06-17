// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";
import API from "./Api";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [objects, setObjects] = useState([])
  const [ProductValues, setProductValues] = useState({})
  const [currentSlide, setCurrentSlide] = useState([])

  // Main function
  const runCoco = async () => {
    const net = await cocossd.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 500);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      console.log(webcamRef, 'webcam');
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const obj = await net.detect(video);

      setObjects(obj)

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawRect(obj, ctx);
    }
  };

  const handleClick = (data, value, item) => {
    console.log(data, value, item);
  }

  const handleCategoryClick = (value) => {
    console.log(value, 'sfgfsf');
    window.location.href = `https://cicd.cognetrylabsdemo.com/productlisting/:search.${value}`
  }

  useEffect(() => {
    if (!objects.length) return

    const handlePRoductRedirection = async () => {

      objects.map(async (obj) => {
        const searchResults = await API.get(`https://cicd.cognetrylabsdemo.com/inventory/items/IDEAL/store/STORE_1/findAll/100/${obj.class}`
        ).then((res) => res.data) || []
        setCurrentSlide(searchResults)
        let array = []
        searchResults.map(item => (
          item.stock_qty >= 1 &&
          array.push({ name: item.category_name, keywords: item.keywords, category_id: item.category_id })
        ))
        let unique = [...new Set(array.map(item => item.name))]
        let newArray = []
        unique.map(item => (
          newArray.push({ name: item, keywords: array.find(i => i.name === item).keywords, category_id: array.find(i => i.name === item).category_id })
        ))
        setProductValues(ProductValues => ({ ...ProductValues, [obj.class]: newArray }))

      })
      console.log(ProductValues, 'result');
      // window.location.href = `https://cicd.cognetrylabsdemo.com/productlisting/:search.${value}`
    }
    handlePRoductRedirection()
  }, [objects.length])

  useEffect(() => { runCoco() }, []);

  return (
    <div className="App">
      <header style={{ height: '100vh' }} className="App-header">
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            position: 'relative',
          }}
        />

        <canvas
          onClick={handleClick}
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
        <div className="buttons-wrapper" style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          padding: "15px",
        }}>
          {
            Object.keys(ProductValues).map((product) => (
              ProductValues[product]?.map((value) => {
                return (
                  <button
                    onClick={() => handleCategoryClick(value.category_id)}
                    style={{
                      bottom: 0,
                      marginBottom: '30px',
                      marginRight: '15px',
                      borderRadius: '10px',
                      padding: '4px 10px',
                      boxShadow: '0px 2px 6px rgba(80, 110, 123, 0.6)',
                      border: 0,
                      outline: 0,
                    }} color="white">{value.category_id}</button>
                )
              })
            ))
          }
        </div>
      </header>
    </div>
  );
}

export default App;
