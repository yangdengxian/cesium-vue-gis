<template>
    <a-layout>
      <a-layout-sider>
            <a-button type="primary" @click="addChannel1" block>
                渠沟道1
            </a-button>
            <a-button type="primary" @click="addChannel2" block>
                渠沟道2
            </a-button>
            <a-button type="primary" @click="addChannel3" block>
                渠沟道3
            </a-button>
            <a-button type="primary" @click="addChannel4" block>
                渠沟道4
            </a-button>
            <a-button type="primary" @click="addLadder" block>
                防洪墙
            </a-button>
      </a-layout-sider>
      <a-layout>
        <div :id="id"></div>
      </a-layout>
    </a-layout>
  
</template>

<script>
    import 'ol/ol.css';
    import Map from 'ol/Map';
    import OSM from 'ol/source/OSM';
    import TileLayer from 'ol/layer/Tile';
    import View from 'ol/View';
    import {fromLonLat} from 'ol/proj';
    import VectorLayer from 'ol/layer/Vector';
    import VectorSource from 'ol/source/Vector';
    import {Style,Stroke} from 'ol/style';
    import FlowLineDashStyle from '@/lib/style/FlowLineDashStyle'
    import FlowLineStyle from '@/lib/style/FlowLineStyle'
    import axios from 'axios'
    import GeoJSON from 'ol/format/GeoJSON';
    import {MultiLineString,MultiPolygon,LineString} from 'ol/geom';
    import Feature from 'ol/Feature'
    import { ol_coordinate_offsetCoords,ol_coordinate_equal } from 'ol-ext/geom/GeomUtils';
    import 'ol-ext/render/Cspline';
    import TurfLineChunk from '@turf/line-chunk';
    import TurfDestination from '@turf/destination';
    import TurfDistance from '@turf/point-to-line-distance';
    import {
        lineString as TurfLineString,
    } from '@turf/helpers';
    export default {
        name: 'Channel1',
        data() {
            return {
                id: "map",
                // featuresUrl: './data/test.geojson',
                featuresUrl: './data/china.geojson',
            }
        },
        props: {
        
        },
        mounted() {
            const map = new Map({
                layers: [
                    new TileLayer({
                    source: new OSM(),
                    }),
                ],
                target: this.id,
                view: new View({
                    center: fromLonLat([116.39164, 39.89871]),
                    zoom: 5,
                }),
            });
            const vectorSource = new VectorSource();
            const vectorLayer = new VectorLayer({
                source: vectorSource,
            })
            this.vectorLayer = vectorLayer;
            this.vectorSource = vectorSource;
            this.map = map;
            window.map = map;
            map.addLayer(vectorLayer);
            
            this.addFeatures();
        },
        methods: {

            addChannel1() {
                const styles = [
                    new Style({
                        stroke: new Stroke({
                            color:"rgb(0,255,0)",
                            width:4,
                            lineCap:"butt",
                        }),
                    }),
                    new Style({
                        stroke: new Stroke({
                            color:"rgb(255,255,255)",
                            width: 16,
                            lineDash: [4, 16],
                            lineCap:"butt",
                        }),
                    }),
                    new Style({
                        stroke: new Stroke({
                            color:"rgb(0,255,0)",
                            width:4,
                            lineCap:"butt",
                        }),
                    }),
                ]
                this.vectorLayer.setStyle(
                    styles
                );
                
            },

            addChannel2() {
                const styles = [
                    new Style({
                        stroke: new Stroke({
                            color:"rgb(0,255,0)",
                            width:2,
                            lineDash:[15,15],
                        }),
                    })
                ]
                this.vectorLayer.setStyle(
                    styles
                );
            },

            addChannel3() {
                const styles = [
                    new FlowLineStyle({
                        color: "rgb(0,255,0)",
                        width: 2,
                        arrowSize: [8,8],
                        arrow: 1,
                        map: this.map
                    }),
                    new FlowLineStyle({
                        color: "rgb(0,255,0)",
                        width: 2,
                        map: this.map
                    }),
                ]
                this.vectorLayer.setStyle(
                    styles
                );
            },

            addChannel4() {
                const styles = [
                    new FlowLineStyle({
                        color: "rgb(0,255,0)",
                        width: 2,
                        arrowSize: [8,8],
                        arrow: 1,
                        map: this.map
                    }),
                    new FlowLineDashStyle({
                        color: "rgb(0,255,0)",
                        width: 2,
                        lineDash: [20,10],
                        map: this.map
                    })]

                this.vectorLayer.setStyle(styles);
            },

            addLadder() {
                const self = this;
                
                const styles = function (feature,res) {
                    let {offsetGeo,geo} = cutAngleLine(feature,self.map,4);
                    return [
                        new Style({
                            stroke: new Stroke({
                                color: '#4B7110',
                                width: 1,
                            }),
                            geometry: geo,
                        }),
                        /* new Style({
                            stroke: new Stroke({
                                color: '#4B7110',
                                width: 1,
                            }),
                            geometry: offsetGeo,
                        }), */
                    ];
                }

                this.vectorLayer.setStyle(styles);
            },


            addFeatures() {
                let newFeatures = [];
                this.vectorSource.clear();
                axios.get(this.featuresUrl).then((response) => {
                    const features = new GeoJSON().readFeatures(response.data);
                    for (let i = 0; i < features.length; i++) {
                        const feature = features[i];
                        const geo = feature.getGeometry().transform("EPSG:4326","EPSG:3857");
                        feature.setGeometry(geo)
                        newFeatures.push(feature); 
                    }
                    this.vectorSource.addFeatures(newFeatures);
                })
                
            }
        }
        
    }

    function cspline(geometry) {
        if (!geometry) return;
        const opt = {
            tension: 0.6,
            pointsPerSeg: 100
        };
        return geometry.cspline(opt);
    }

    function cutAngleLine(feature,map,size) {
        let geometry = feature.getGeometry();
        let res = map.getView().getResolution();
        var coordinates = [];
        
        //线段斜率和线段夹角
        var tanA = [],
            atanA = [],
            chunks = [],
            chunksOffset = [];
        if (!geometry) return;
        switch (geometry.getType()) {
            case 'LineString':
                geometry.forEachSegment(function (s, e) {
                    chunks.push([s, e]);
                    chunksOffset.push(ol_coordinate_offsetCoords([s, e], size * res));
                });
                return {
                    offsetGeo: new LineString(chunksOffset),
                    geo: new LineString(chunks),
                }
            case 'MultiLineString':
                var lines = geometry.getLineStrings();
                //线段斜率和线段夹角
                for (let j = 0; j < lines.length; j++) {
                    var singleLine = lines[j];
                    chunks[j] = [];
                    chunksOffset[j] = [];
                    singleLine.forEachSegment(function (s, e) {
                        chunks[j].push([s, e]);
                        chunksOffset[j].push(ol_coordinate_offsetCoords([s, e], size * res));
                    })
                }

                return {
                    offsetGeo: new MultiLineString(chunksOffset),
                    geo: new MultiLineString(chunks),
                }
        }
    }


    function intersectionPoint(pointA,pointB,pointC) {
        /// > y = ax +b;  对应垂线方程为 y = -(1/a)x + m;(m为系数)
        /// > A = a; B = b;
        let a = (pointA[1] - pointB[1]) / (pointA[0] - pointB[0]);
        let b = pointA[1] - a * pointA[0];
        let atanA = 1/a;
        let m = pointC[1] + atanA * pointC[0];
        let cross = [];
        cross[0] = (m-b)*a/(a + 1);
        cross[1] = a * cross[0] + b;
        return cross;
    }

    function divideLineToMulti(feature,step_pixels,map,isPopAndShift = true,condition,conditionVal) {
        let geometry = feature.getGeometry();
        let res = map.getView().getResolution();
        if (!geometry) return;
        switch (geometry.getType()) {
            case 'LineString':
                return geometry;
            case 'MultiLineString':
                var lines = geometry.getLineStrings();
                var coordinates = [];
                //线段斜率和线段夹角
                var tanA = [],
                    atanA = [],
                    chunks = [];
                for (let j = 0; j < lines.length; j++) {
                    var singleLine = lines[j];
                    chunks = [];

                    singleLine.forEachSegment(function (s, e) {
                        var l = new LineString([s, e]).transform("EPSG:3857", "EPSG:4326");
                        var line = TurfLineString(l.getCoordinates());
                        var chunk = TurfLineChunk(line, (step_pixels || 4) * res / 1000, { units: 'kilometers' });
                        chunks.push(chunk);
                        tanA.push((s[1] - e[1]) / (s[0] - e[0]));
                    })
                }

                for (let j = 0; j < tanA.length - 1; j++) {
                    //线段夹角
                    atanA.push(Math.atan(Math.abs((tanA[j] - tanA[j + 1]) / (1 + tanA[j] * tanA[j + 1]))) * 180 / Math.PI)
                }
                //夹角与线段数量保持一致，最后一个默认为0
                atanA.push(0);
                
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    console.log("夹角",atanA[i]);
                    if (isPopAndShift) {
                        switch (condition) {
                            case "greater":
                                //如果两线段夹角大于，去除首尾点
                                if (atanA[i] > +conditionVal) {
                                    chunk["features"].shift();
                                    chunk["features"].pop();
                                }
                                break;

                            case "less":
                                //如果两线段夹角小于，去除首尾点
                                if (atanA[i] < +conditionVal) {
                                    chunk["features"].shift();
                                }
                                break;
                        
                            default:
                                //如果两线段夹角大于2度，去除首尾点
                                if (atanA[i] > 2) {
                                    chunk["features"].shift();
                                    chunk["features"].pop();
                                }
                                break;
                        }
                        
                    }



                    for (let i = 0; i < chunk["features"].length; i++) {
                        const feature = chunk["features"][i];
                        //至少俩点
                        const featureCoords = feature.geometry.coordinates;
                        if (featureCoords.length > 2 ||
                            (featureCoords.length == 2 &&
                                !ol_coordinate_equal(featureCoords[0], featureCoords[1]))) {
                            coordinates.push(feature.geometry.coordinates);
                        }

                    }
                }
                return new MultiLineString(coordinates).transform("EPSG:4326", "EPSG:3857");

            case "Polygon":
                return geometry;

            case "MultiPolygon":
                return geometry;
            default:
                return geometry;
        }
    }

    /**
     * 坐标偏移
     * @param {ol.Feature} feature 要素
     * @param {number} size 偏移量
     * @param {Map} olMap openlayers map
     * @returns {ol.geom.Geometry}
     */
    function offsetGeometry(feature, size, olMap,res) {
        var geometry = feature.getGeometry();
        var map = olMap;
        var coords;
        res = res || map.getView().getResolution();
        size = res * size;
        switch (geometry.getType()) {
            case 'Polygon':
                coords = geometry.getCoordinates();
                coords[0] = ol_coordinate_offsetCoords(coords[0], size);
                return new MultiPolygon([coords]);

            case 'MultiPolygon':
                coords = geometry.getCoordinates();
                for (let i = 0; i < coords.length; i++) {
                    coords[i][0] = ol_coordinate_offsetCoords(coords[i][0], size);
                }
                // coords[0][0] = ol_coordinate_offsetCoords(coords[0][0], size);
                return new MultiPolygon(coords);
            case 'LineString':
                coords = geometry.getCoordinates();
                coords = ol_coordinate_offsetCoords(coords, size);
                return new MultiLineString([coords]);
            case 'MultiLineString':
                coords = geometry.getCoordinates();
                for (let i = 0; i < coords.length; i++) {
                    coords[i] = ol_coordinate_offsetCoords(coords[i], size);
                }
                return new MultiLineString(coords);
            default:
                return geometry;
        }
    }
</script>

<style scoped>
    #map {
        width: 100%;
        height:1000px;
    }
</style>
