/* eslint-disable no-prototype-builtins */
/** @jsx jsx */
import { type AllWidgetProps, jsx } from 'jimu-core'
import { useState } from 'react'
import type { IMConfig } from '../config'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'

import type Point from 'esri/geometry/Point'

import defaultMessages from './translations/default'

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';


export default function (props: AllWidgetProps<IMConfig>) {
  // private view: MapView;
  // private layerList: LayerList;
  const [mapView, setMapView] = useState<JimuMapView>(null)
  const [layerList, setLayerList] = useState<any>(null)

  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [zoom, setZoom] = useState<number>(0)
  const [scale, setScale] = useState<number>(0)
  const [mapViewReady, setMapViewReady] = useState<boolean>(false)


  // This function is called when the active view changes.
  // It is passed the new view as a parameter.
  // We use this to set the mapView state variable.
  // We also set the layerList state variable to the layer list of the new view.
  const activeViewChange = (views: { [viewId: string]: JimuMapView }) => {
    const jmv = Object.values(views)[0] // Get the first JimuMapView from the views object
    if (jmv) {
      setMapView(jmv)
      console.log('activeViewChange', jmv)
      setLayerList(jmv.view.allLayerViews)

      // Find layer title AGIL_190208
      const layer = jmv.view.allLayerViews.find((layer: any) => {
        return layer.layer.title === 'AGIL 190208'
      })

      const url = (layer?.layer as __esri.FeatureLayer)?.url

      const _layer = new FeatureLayer({
        url
      });

      const query = _layer.createQuery();
      query.where = '1=1'; // get all features
      query.outFields = ['*']; // or specific fields
      query.returnGeometry = true;

      _layer.queryFeatures(query).then((result) => {
        const features = result.features;
        features.forEach(feature => {
          console.log('feature', feature);
          const geometry = feature.geometry; // e.g., Point
          const attributes = feature.attributes;

          console.log("Coordinates:", geometry);
          console.log("Attributes:", attributes);
        });
      });
    }
  }

  const activeViewChangeHandler = (jmv: JimuMapView) => {
    if (jmv) {
      // When the extent moves, update the state with all the updated values.
      jmv.view.watch('extent', evt => {
        setLatitude(jmv.view.center.latitude.toFixed(3))
        setLongitude(jmv.view.center.longitude.toFixed(3))
        setScale(Math.round(jmv.view.scale * 1) / 1)
        setZoom(jmv.view.zoom)

        // this is set to false initially, then once we have the first set of data (and all subsequent) it's set
        // to true, so that we can hide the text until everything is ready:
        setMapViewReady(true)
      })

      // When the pointer moves, take the pointer location and create a Point
      // Geometry out of it (`view.toMap(...)`), then update the state.
      jmv.view.on('pointer-move', evt => {
        const point: Point = jmv.view.toMap({
          x: evt.x,
          y: evt.y
        })
        setLatitude(point.latitude.toFixed(3))
        setLongitude(point.longitude.toFixed(3))
        setScale(Math.round(jmv.view.scale * 1) / 1)
        setZoom(jmv.view.zoom)
        setMapViewReady(true)
      })
    }
  }

  const sections = []

  sections.push(
    <span>
      {defaultMessages.latLon} {latitude} {longitude}
    </span>
  )

  if (props?.config?.showZoom) {
    sections.push(<span>Zoom {zoom.toFixed(0)}</span>)
  }

  if (props?.config?.showScale) {
    sections.push(<span>Scale 1:{scale}</span>)
  }

  // We have 1, 2, or 3 JSX Elements in our array, we want to join them
  // with " | " between them. You cannot use `sections.join(" | ")`, sadly.
  // So we use array.reduce(...) to return an array of JSX elements.
  const allSections = sections.reduce((previousValue, currentValue) => {
    return previousValue === null
      ? [currentValue]
      : [...previousValue, ' | ', currentValue]
  }, null)

  return (
    <div className="widget-get-map-coordinates jimu-widget m-2">
      {props.hasOwnProperty('useMapWidgetIds') &&
        props.useMapWidgetIds &&
        props.useMapWidgetIds.length === 1 && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onActiveViewChange={activeViewChangeHandler}

            onViewsCreate={activeViewChange}
          />
        )}

      {/* Show map name and id */}
      <p>
        {props?.label}
      </p>
      {/* Only show the data once the MapView is ready */}
      <p>{mapViewReady ? allSections : defaultMessages.latLonWillBeHere}</p>

      <hr />
      <p>
        Map name: {mapView?.status}
      </p>

      <hr />
      {/* Selected map layer */}
      <p>
        Selected map layers:
      </p>
      <ul>
        {layerList &&
          layerList
          .map((layer: any, index: number) => {
            return (
              <li key={index}>
                {layer.layer.title}
              </li>
            )
          })}
        {layerList && layerList.length === 0 && (
          <li>
            No layers in the map.
          </li>
        )}
      </ul>
    </div>
  )
}