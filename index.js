require([
  'esri/Map',
  'esri/views/MapView',
  'esri/Graphic',
  'esri/layers/FeatureLayer',
  'esri/layers/GroupLayer',
  'esri/widgets/LayerList',
  'esri/widgets/Slider',
], function(Map, MapView, Graphic, FeatureLayer, GroupLayer, LayerList, Slider){

  /**
   * Create random Features.
   *
   * @param {*} total The number of features to create.
   */
  function createFeatures(total = 1) {
    const polygons = turf.randomPolygon(total, {bbox: [-130, 20, -90, 40]});

    const features = [];
    turf.featureEach(polygons, function (currentFeature) {
      features.push(Graphic.fromJSON({
        geometry: {
          type: 'polygon', // autocasts as new Point()
          rings: currentFeature.geometry.coordinates.map((coordinate) => coordinate.reverse()),
        }
      }));
    });

    return features;
  }

  /**
   * Create GroupLayer with x FeatureLayers.
   *
   * @param {number} total The number of FeatureLayers to create.
   * @param {boolean} group Return FeatureLayers bounded to a GroupLayer.
   */
  function createFeatureLayers(view, { total = 10, group = false, title = 'Unknown', color = [ 51, 51, 204, 0.9 ] } = {}) {
    const layers = [];

    [...Array(total).keys()].forEach(() => {
      const polygonRenderer = {
        type: 'simple',  // autocasts as new SimpleRenderer()
        symbol: {
          type: 'simple-fill',  // autocasts as new SimpleFillSymbol()
          color,
          style: 'solid',
          outline: {  // autocasts as new SimpleLineSymbol()
            color: 'white',
            width: 1
          }
        }
      };

      const features = createFeatures(1);

      const fl = new FeatureLayer({
        title,
        source: features,
        renderer: polygonRenderer,
        objectIDField: 'ObjectID',
        fields: [
          {
            name: 'ObjectID',
            alias: 'ObjectID',
            type: 'oid'
          },
          {
            name: 'ProjectName',
            alias: 'ProjectName',
            type: 'string'
          },
          {
            name: 'SiteName',
            alias: 'SiteName',
            type: 'string'
          }
        ]
      });

      layers.push(fl);
    });

    if (group) {
      const groupLayer = new GroupLayer();

      groupLayer.addMany(layers);

      return [groupLayer];
    } else {
      return layers;
    }
  }

  function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  // create the map view
  const map = new Map({
    basemap: 'gray'
  });

  const view = new MapView({
    container: 'map',
    map: map,
    center: [-110, 30],
    zoom: 5
  });

  view.when(() => {
    var layerList = new LayerList({
      view: view,
      listItemCreatedFunction: ({ item }) => {
        if (item.title === "Root") {
          item.open = true;
        }
      }
    });

    // Add widget to the top right corner of the view
    view.ui.add(layerList, "top-right");

    const slider = new Slider({
      container: 'slider',
      min: 1,
      max: 10,
      values: [ 5 ],
      snapOnClickEnabled: false,
      precision: 0,
      visibleElements: {
        labels: true,
        rangeLabels: true
      }
    });

    const root = new GroupLayer({
      title: 'Root'
    });

    map.layers.add(root);

    let count = 1;

    const btn = document.getElementById('generate');
    btn.addEventListener('click', () => {
      function createGroup() {
        let cnt = count;

        const color = [
          randomInt(0, 255),
          randomInt(0, 255),
          randomInt(0, 255),
          randomFloat(0, 1),
        ];

        const groupC = [
          ...createFeatureLayers(view, { total: 1, title: `FeatureLayer B ${cnt}`, color }),
          ...[
            new GroupLayer({ title: `Group C ${cnt}`}),
            new GroupLayer({ title: `Group C ${cnt}`}),
            new GroupLayer({ title: `Group C ${cnt}`}),
          ].map((layer) => {
            setTimeout(() => {
              layer.layers.addMany([
                ...createFeatureLayers(view, { total: 2, title: `FeatureLayer C ${cnt}`, color })
              ]);
            }, randomInt(200, 1000));

            return layer;
          }),
        ];

        const groupB = new GroupLayer({ title: `Group B ${cnt}` });
        setTimeout(() => {
          groupB.addMany(groupC);
        }, randomInt(200, 1000));

        const groupA = new GroupLayer({ title: `Group A ${cnt}` });

        setTimeout(() => {
          groupA.addMany([
            ...createFeatureLayers(view, { total: 7, title: `FeatureLayer ${cnt} A ${cnt}`, color }),
            groupB,
          ]);
        }, randomInt(200, 1000));

        count++;

        return groupA;
      }

      const layers = [];

      for (let i = 0; i < slider.values[0]; i++) {
        layers.push(createGroup());
      }

      root.removeAll();

      count = 1;

      root.addMany(layers.reverse());
    });

    console.info('App is ready!', { map, view });

    const ui = document.getElementById("ui");

    view.whenLayerView(root).then(() => {
      view.ui.add(ui, "bottom-center")
      ui.classList.add("loaded");
    });
  });
});