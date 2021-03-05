# UI blocking with deep nested GroupLayer's

This repository contains a sample Application, which demonstrates an issue causing the UI to block when multiple layers are loaded lazy in a deep nested hierarchical structure.

## How to reproduce?
The application in this repository provides an example how to reproduce the previously described issue:

Therefore a root GroupLayer is cretated, when the applications MapView is ready. By clicking the `GENERATE` Button, `x` GroupLayers are created, where each created GroupLayer is created with an identical hierarchical structure, which consists of GroupLayers and Client-Side-FeatureLayers. The creation of each layer is created asynchronously. `x`, the number of GroupLayers to create, can be controlled by a Slider. With increasing `x` the UI blocks more heavily. With decreasing `x` the UI blocks less, but it blocks noticable.
