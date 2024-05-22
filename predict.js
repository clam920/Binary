// REMOVE DEPENDENCY
// import * as tf from '@tensorflow/tfjs';

// REMOVE DEPENDENCY
// const { getSync } = require('@andreekeberg/imagedata')

const tf = require("@tensorflow/tfjs-node");

async function predict(imageEncoding) {   
    // TO DO: How to serve up model? 
    const model_url = 'http://localhost:3050/TrainedModel-15/model.json'
    const model = await tf.loadLayersModel(model_url);

    image = tf.node.decodeImage(imageEncoding).resizeNearestNeighbor([224, 224]).toFloat().div(255.0).expandDims(0);;
    // console.log(image);

    const predictionTensor = model.predict(image);
    predictionTensor.print();

    const predictionData = await predictionTensor.data();
    const categories = ['Cardboard', 'Glass', 'Plastic', 'Paper', 'Metal', 'Trash'];

    for (let i = 0; i < categories.length; i++) {
        console.log(categories[i] + ": " + predictionData[i]);
    }

    // find maximum
    for (let i = 0, max = -1; i < categories.length; i++) {
        if (predictionData[i] > max) {
            max = predictionData[i];
            maxIndex = i;
        }
    }

    const prediction = categories[maxIndex];
    return prediction;
}

module.exports=predict;